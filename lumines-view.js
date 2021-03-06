var Lumines = Lumines || {};


Lumines.StageView = function(canvas, stageWidth, stageHeight, unit)
{
    this.canvas = canvas;
    this.unit = unit;

    this.canvas.width = (stageWidth + 4 + 4) * (this.unit + 1);
    this.canvas.height = (stageHeight + 3 + 2) * (this.unit + 1);

    this.ctx = this.canvas.getContext("2d");
};

Lumines.StageView.prototype = {
    draw: function(data)
    {
        this.ctx.fillStyle = "#333333";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawNextField(data, this.unit + 1, this.unit + 1);

        this.drawField(data, 4 * (this.unit + 1), this.unit + 1);
    },

    drawField: function(data, offsetX, offsetY)
    {
        this.ctx.translate(offsetX, offsetY);

        // field
        this.ctx.translate(0, 2 * (this.unit + 1));

        var field = data.field;

        this.ctx.fillStyle = "#555555"
        this.ctx.fillRect(0, 0, field.width * (this.unit + 1), field.height * (this.unit + 1));

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#aaaaaa";
        this.ctx.strokeRect(-0.5, -0.5, field.width * (this.unit + 1), field.height * (this.unit + 1));

        for (var x = 0; x < field.width; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * (this.unit + 1) - 0.5, -0.5);
            this.ctx.lineTo(x * (this.unit + 1) - 0.5, field.height * (this.unit + 1) - 0.5);
            this.ctx.stroke();
        }
        for (var y = 0; y < field.height; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(-0.5, y * (this.unit + 1) - 0.5);
            this.ctx.lineTo(field.width * (this.unit + 1) - 0.5, y * (this.unit + 1) - 0.5);
            this.ctx.stroke();
        }

        for (var x = 0; x < field.width; x++) {
            for (var y = 0; y < field.height; y++) {
                var block = field.blockAt(x, y);
                if (block != null) {
                    this.drawBlock(block, x * (this.unit + 1), y * (this.unit + 1));
                } else {
                }
            }
        }

        // target blocks
        var targets = data.targetBlocks;
        targets.sort(function(a, b){
            var c = a.y - b.y;
            if (c == 0)
                c = a.x - b.x;
            return c;
        });
        var position = [
            [
                Lumines.QuadBlock.Position.TOP_LEFT,
                Lumines.QuadBlock.Position.BOTTOM_LEFT,
            ],
            [
                Lumines.QuadBlock.Position.TOP_RIGHT,
                Lumines.QuadBlock.Position.BOTTOM_RIGHT
            ]
        ];
        for (var i = 0; i < targets.length; i++) {
            var target = targets[i];
            for (var y = 0; y < 2; y++) {
                for (var x = 0; x < 2; x++) {
                    for (var j = 0; j < position.length; j++) {
                        var pos = position[x][y];
                        var block = target.blockAt(pos);
                        this.drawTargetBlock(block, (target.x + x) * (this.unit + 1), (target.y + y) * (this.unit+ 1), pos);
                    }
                }
            }
        }

        // moving block
        var block = data.movingBlock;
        if (block != null) {
            this.drawQuadBlock(block, block.x * (this.unit + 1), block.y * (this.unit + 1));
        }

        // mass detection
        var mass = new Array();
        for (var i = targets.length - 1; i >= 0; i--) {
            var connect = -1;
            for (var j = 0; j < mass.length; j++) {
                if (mass[j] == null)
                    continue;
                for (var k = 0; k < mass[j].length; k++) {
                    if (this.checkConnection(targets[i], mass[j][k])) {
                        if (connect == -1) {
                            mass[j].push(targets[i]);
                            connect = j;
                        } else {
                            mass[connect] = mass[connect].concat(mass[j]);
                            mass[j] = null;
                        }
                        break;
                    }
                }
            }
            if (connect == -1) {
                mass.push([targets[i]]);
            }
        }
        for (var i = 0; i < mass.length; i++) {
            if (mass[i] != null) {
                var x = mass[i][0].x * (this.unit + 1) - 3;
                var y = (mass[i][0].y + 2) * (this.unit + 1) - (this.unit / 2) - 3;
                this.drawNumber(mass[i].length, x, y, 3);
            }
        }

        // timeline
        var tunit = this.unit / 2;
        var tx = data.timeline * (this.unit + 1);
        var ty = -1 * (this.unit + 1) + 3;
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#ffd50d";
        this.ctx.moveTo(tx, field.height * (this.unit + 1));
        this.ctx.lineTo(tx, ty);
        this.ctx.stroke();

        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(tx - (this.unit * 2 - 2) + 0.5, ty + 0.5, this.unit * 2 - 3, this.unit - 1);

        this.ctx.beginPath();
        this.ctx.moveTo(tx + 0.5, ty + 0.5);
        this.ctx.lineTo(tx + tunit, ty + tunit);
        this.ctx.lineTo(tx, ty + (tunit * 2));
        this.ctx.stroke();
        
        this.drawNumber(data.totalDeleted - data.recentDeleted, tx - (this.unit * 2 - 2) + 3, ty + 4, 2);

        // deleted
        this.drawText("DELETED", field.width * (this.unit + 1) + 4, 6);
        this.drawNumber(data.totalDeleted, field.width * (this.unit + 1) + 4, this.unit + 5, 5);

        this.ctx.translate(0, -2 * (this.unit + 1));

        this.ctx.translate(-offsetX, -offsetY);
    },

    drawNextField: function(data, offsetX, offsetY)
    {
        this.ctx.translate(offsetX, offsetY);
        
        for (var i = 0; i < 3; i++) {
            this.drawQuadBlock(data.nextBlocks[i], 0, i * this.unit * 3);
        }
        
        this.ctx.translate(-offsetX, -offsetY);
    },
    
    drawBlock: function(block, x, y)
    {
        if (block.isErasing()) {
            this.ctx.fillStyle = "#888888";
            this.ctx.fillRect(x, y, this.unit, this.unit);

            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#444444";
            this.ctx.strokeRect(x - 0.5, y - 0.5, this.unit + 1, this.unit + 1);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "#777777";
            this.ctx.strokeRect(x + 1, y + 1, this.unit - 2, this.unit - 2);

            return;
        }
        
        if (block.isSpTarget()) {
            if (block.color == Lumines.Block.Color.WHITE) {
                this.ctx.fillStyle = "#7aa2c0";
            } else {
                this.ctx.fillStyle = "#887665";
            }
            this.ctx.fillRect(x, y, this.unit, this.unit);
            
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#ffffff";
            this.ctx.strokeRect(x - 0.5, y - 0.5, this.unit + 1, this.unit + 1);

            return;
        }

        if (block.color == Lumines.Block.Color.WHITE) {
            this.ctx.fillStyle = "#f8f8f8";
        } else {
            this.ctx.fillStyle = "#ff9939";
        }
        this.ctx.fillRect(x, y, this.unit, this.unit);

        if (block.hasSpecial) {
            var u = this.unit / 4;
            this.ctx.fillStyle = "#a8a8a8";
            this.ctx.fillRect(x + u, y + u, u * 2, u * 2);
            this.ctx.fillStyle = "#40ebc3";
            this.ctx.fillRect(x + u + 1, y + u + 1, u * 2 - 2, u * 2 - 2);
            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(x + u + 1, y + u + 1, 2, 2);
        }

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#666666";
        this.ctx.strokeRect(x - 0.5, y - 0.5, this.unit + 1, this.unit + 1);
    },

    drawQuadBlock: function(block, x, y)
    {
        if (block == null)
            return;

        this.drawBlock(block.blockAt(Lumines.QuadBlock.Position.TOP_LEFT), x, y);
        this.drawBlock(block.blockAt(Lumines.QuadBlock.Position.TOP_RIGHT), x + this.unit + 1, y);
        this.drawBlock(block.blockAt(Lumines.QuadBlock.Position.BOTTOM_LEFT), x, y + this.unit + 1);
        this.drawBlock(block.blockAt(Lumines.QuadBlock.Position.BOTTOM_RIGHT), x + this.unit + 1, y + this.unit + 1);
    },

    drawTargetBlock: function(block, x, y, position)
    {
        if (block.isErasing())
            return;

        var innerX = x;
        var innerY = y;
        var outerX = x;
        var outerY = y;
        if (position == Lumines.QuadBlock.Position.TOP_LEFT) {
            outerX = innerX - 2;
            outerY = innerY - 2;
        }
        if (position == Lumines.QuadBlock.Position.TOP_RIGHT) {
            innerX--;
            outerX = innerX;
            outerY = innerY - 2;
        }
        if (position == Lumines.QuadBlock.Position.BOTTOM_LEFT) {
            innerY--;
            outerX = innerX - 2;
            outerY = innerY;
        }
        if (position == Lumines.QuadBlock.Position.BOTTOM_RIGHT) {
            innerX--;
            innerY--;
            outerX = innerX;
            outerY = innerY;
        }

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(outerX, outerY, this.unit + 3, this.unit + 3);

        if (block.color == Lumines.Block.Color.WHITE) {
            this.ctx.fillStyle = "#b1b1b1";
        } else {
            this.ctx.fillStyle = "#ff9939";
        }
        this.ctx.fillRect(innerX, innerY, this.unit + 1, this.unit + 1);
    },

    checkConnection: function(a, b)
    {
        if (a.blockAt(Lumines.QuadBlock.Position.TOP_LEFT).color
            != b.blockAt(Lumines.QuadBlock.Position.TOP_LEFT).color)
            return false;

        if (b.y == a.y + 2) {
            if (b.x == a.x + 1) return true;
            if (b.x == a.x)     return true;
            if (b.x == a.x - 1) return true;
        } else if (b.y == a.y + 1) {
            if (b.x == a.x + 2) return true;
            if (b.x == a.x + 1) return true;
            if (b.x == a.x)     return true;
            if (b.x == a.x - 1) return true;
            if (b.x == a.x - 2) return true;
        } else if (b.y == a.y) {
            if (b.x == a.x + 2) return true;
            if (b.x == a.x + 1) return true;
        }
        return false;
    },

    drawNumeral: function(n, x, y, sizex, sizey)
    {
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        switch (n) {
        case 0:
            this.ctx.moveTo(x, y + 1);
            this.ctx.lineTo(x + sizex - 1, y + 1);
            this.ctx.lineTo(x + sizex - 1, y + sizey - 1);
            this.ctx.lineTo(x + 1, y + sizey - 1);
            this.ctx.lineTo(x + 1, y);
            this.ctx.stroke();
            break;
        case 1:
            this.ctx.moveTo(x + sizex - 6, y + 1);
            this.ctx.lineTo(x + sizex - 3, y + 1);
            this.ctx.lineTo(x + sizex - 3, y + sizey);
            this.ctx.stroke();
            break;
        case 2:
            this.ctx.moveTo(x, y + 1);
            this.ctx.lineTo(x + sizex - 1, y + 1);
            this.ctx.lineTo(x + sizex - 1, y + (sizey / 2));
            this.ctx.lineTo(x + 1, y + (sizey / 2));
            this.ctx.lineTo(x + 1, y + sizey - 1);
            this.ctx.lineTo(x + sizex, y + sizey - 1);
            this.ctx.stroke();
            break;
        case 3:
            this.ctx.moveTo(x, y + 1);
            this.ctx.lineTo(x + sizex - 1, y + 1);
            this.ctx.lineTo(x + sizex - 1, y + sizey - 1);
            this.ctx.lineTo(x, y + sizey - 1);
            this.ctx.stroke();
            this.ctx.moveTo(x + 1, y + (sizey / 2));
            this.ctx.lineTo(x + sizex, y + (sizey / 2));
            this.ctx.stroke();
            break;
        case 4:
            this.ctx.moveTo(x + 1, y);
            this.ctx.lineTo(x + 1, y + sizey - 3);
            this.ctx.lineTo(x + sizex, y + sizey - 3);
            this.ctx.stroke();
            this.ctx.moveTo(x + sizex - 3, y);
            this.ctx.lineTo(x + sizex - 3, y + sizey);
            this.ctx.stroke();
            break;
        case 5:
            this.ctx.moveTo(x + sizex, y + 1);
            this.ctx.lineTo(x + 1, y + 1);
            this.ctx.lineTo(x + 1, y + (sizey / 2));
            this.ctx.lineTo(x + sizex - 1, y + (sizey / 2));
            this.ctx.lineTo(x + sizex - 1, y + sizey - 1);
            this.ctx.lineTo(x, y + sizey - 1);
            this.ctx.stroke();
            break;
        case 6:
            this.ctx.moveTo(x + sizex - 1, y + 1);
            this.ctx.lineTo(x + 1, y + 1);
            this.ctx.lineTo(x + 1, y + sizey - 1);
            this.ctx.lineTo(x + sizex - 1, y + sizey - 1);
            this.ctx.lineTo(x + sizex - 1, y + (sizey / 2));
            this.ctx.lineTo(x + 1, y + (sizey / 2));
            this.ctx.stroke();
            break;
        case 7:
            this.ctx.moveTo(x, y + 1);
            this.ctx.lineTo(x + sizex - 1, y + 1);
            this.ctx.lineTo(x + sizex - 1, y + sizey);
            this.ctx.stroke();
            break;
        case 8:
            this.ctx.moveTo(x, y + 1);
            this.ctx.lineTo(x + sizex - 1, y + 1);
            this.ctx.lineTo(x + sizex - 1, y + sizey - 1);
            this.ctx.lineTo(x + 1, y + sizey - 1);
            this.ctx.lineTo(x + 1, y);
            this.ctx.stroke();
            this.ctx.moveTo(x + 1, y + (sizey / 2));
            this.ctx.lineTo(x + sizex - 1, y + (sizey / 2));
            this.ctx.stroke();
            break;
        case 9:
            this.ctx.moveTo(x + sizex - 1, y + (sizey / 2));
            this.ctx.lineTo(x + 1, y + (sizey / 2));
            this.ctx.lineTo(x + 1, y + 1);
            this.ctx.lineTo(x + sizex - 1, y + 1);
            this.ctx.lineTo(x + sizex - 1, y + sizey - 1);
            this.ctx.lineTo(x + 1, y + sizey - 1);
            this.ctx.stroke();
            break;
        default:
            break;
        }
    },

    drawNumber: function(number, x, y, width)
    {
        var sizex = this.unit / 16 * 10;
        var sizey = this.unit / 2;
        var widthx = sizex + 2;
        if (width == null || width <= 0) {
            width = 1;
        }

        for (var w = width - 1; ; w--) {
            var n = number % 10;
            number = Math.floor(number / 10);
            this.drawNumeral(n, x + (widthx * w), y, sizex, sizey);
            if (number == 0) {
                break;
            }
        }
    },

    drawChar: function(c, x, y, sizex, sizey)
    {
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        switch (c) {
        case 'd':
        case 'D':
            this.ctx.moveTo(x + sizex - 1, y + 0.5);
            this.ctx.lineTo(x + 0.5, y + 0.5);
            this.ctx.lineTo(x + 0.5, y + sizey - 0.5);
            this.ctx.lineTo(x + sizex - 1, y + sizey - 0.5);
            this.ctx.stroke();
            this.ctx.moveTo(x + sizex - 0.5, y + 1);
            this.ctx.lineTo(x + sizex - 0.5, y + sizey - 1);
            this.ctx.stroke();
            return sizex;
        case 'e':
        case 'E':
            this.ctx.moveTo(x + sizex, y + 0.5);
            this.ctx.lineTo(x + 0.5, y + 0.5);
            this.ctx.lineTo(x + 0.5, y + sizey - 0.5);
            this.ctx.lineTo(x + sizex, y + sizey - 0.5);
            this.ctx.stroke();
            this.ctx.moveTo(x,  y + Math.floor(sizey / 2) + 0.5);
            this.ctx.lineTo(x + sizex,  y + Math.floor(sizey / 2) + 0.5);
            this.ctx.stroke();
            return sizex;
        case 'l':
        case 'L':
            this.ctx.moveTo(x + 0.5, y);
            this.ctx.lineTo(x + 0.5, y + sizey - 0.5);
            this.ctx.lineTo(x + sizex, y + sizey - 0.5);
            this.ctx.stroke();
            return sizex;
        case 't':
        case 'T':
            this.ctx.moveTo(x + sizex, y + 0.5);
            this.ctx.lineTo(x, y + 0.5);
            this.ctx.stroke();
            this.ctx.moveTo(x + Math.floor(sizex / 2) + 0.5,  y);
            this.ctx.lineTo(x + Math.floor(sizex / 2) + 0.5,  y + sizey);
            this.ctx.stroke();
            return sizex;
        default:
            return 0;
        }
    },

    drawText: function(text, x, y)
    {
        var sizex = 7;
        var sizey = 5;

        var chars = text.split('');
        for (var i = 0; i < chars.length; i++) {
            x += this.drawChar(chars[i], x, y, sizex, sizey);
            x += 1;
        }
    },
};
