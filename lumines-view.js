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

        this.drawField(data, 4 * (this.unit + 1), this.unit + 1);

        this.drawNextField(data, this.unit + 1, this.unit + 1);
    },

    drawField: function(data, offsetX, offsetY)
    {
        this.ctx.translate(offsetX, offsetY);

        // field
        this.ctx.translate(0, 2 * (this.unit + 1));

        var field = data.field;

        this.ctx.fillStyle = "#666666"
        this.ctx.fillRect(0, 0, field.width * (this.unit + 1), field.height * (this.unit + 1));

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#CCCCCC";
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

        // timeline
        var tunit = (this.unit - 4) / 2;
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#ffd50d";
        this.ctx.moveTo(data.timeline * (this.unit + 1), field.height * (this.unit + 1));
        this.ctx.lineTo(data.timeline * (this.unit + 1), 0 - this.unit);
        this.ctx.lineTo(data.timeline * (this.unit + 1) - (this.unit + tunit), 0 - this.unit);
        this.ctx.lineTo(data.timeline * (this.unit + 1) - (this.unit + tunit), tunit * 2 - this.unit);
        this.ctx.lineTo(data.timeline * (this.unit + 1), tunit * 2 - this.unit);
        this.ctx.lineTo(data.timeline * (this.unit + 1) + tunit, tunit - this.unit);
        this.ctx.lineTo(data.timeline * (this.unit + 1), 0 - this.unit);
        this.ctx.stroke();

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
        if (block.state == Lumines.Block.State.ERASING) {
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
        
        if (block.color == Lumines.Block.Color.WHITE) {
            this.ctx.fillStyle = "#f8f8f8";
        } else {
            this.ctx.fillStyle = "#ff9939";
        }
        this.ctx.fillRect(x, y, this.unit, this.unit);

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
        if (block.state != Lumines.Block.State.TARGET)
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
};
