var Lumines = Lumines || {};


Lumines.Block = function(color, isSpecial, state)
{
    this.color = (color != null) ? color : Lumines.Block.Color.WHITE;
    this.isSpecial = (isSpecial != null) ? isSpecial : false;
    this.state = (state != null) ? state : Lumines.Block.State.INITIAL;

    this.x = -1;
    this.y = -1;
};

Lumines.Block.prototype = {
    moving: function()
    {
        this.state = Lumines.Block.State.MOVING;
        return true;
    },

    grounding: function()
    {
        if (this.isErasing()) {
            return false;
        }

        this.state = Lumines.Block.State.GROUNDING;
        return true;
    },

    falling: function()
    {
        if (this.isErasing()) {
            return false;
        }

        this.state = Lumines.Block.State.FALLING;
        return true;
    },

    target: function()
    {
        if (this.isErasing()) {
            return false;
        }

        this.state |= Lumines.Block.State.TARGET;
        return true;
    },

    spTarget: function()
    {
        if (this.isErasing()) {
            return false;
        }

        this.state |= Lumines.Block.State.SP_TARGET;
        return true;
    },

    erasing: function()
    {
        if (this.isTarget() || this.isSpTarget()) {
            this.state = Lumines.Block.State.ERASING;
            return true;
        }

        return false;
    },

    isTarget: function()
    {
        if ((this.state & Lumines.Block.State.TARGET) > 0)
            return true;
        return false;
    },

    isSpTarget: function()
    {
        if ((this.state & Lumines.Block.State.SP_TARGET) > 0)
            return true;
        return false;
    },

    isErasing: function()
    {
        if ((this.state & Lumines.Block.State.ERASING) > 0)
            return true;
        return false;
    },

    isMoving: function()
    {
        if ((this.state & Lumines.Block.State.MOVING) > 0)
            return true;
        return false;
    },

    isFalling: function()
    {
        if ((this.state & Lumines.Block.State.FALLING) > 0)
            return true;
        return false;
    },
};

Lumines.Block.Color = {
    WHITE: 0,
    BLACK: 1,
};

Lumines.Block.State = {
    INITIAL:   0,
    MOVING:    1,
    GROUNDING: 2,
    FALLING:   4,
    TARGET:    8,
    SP_TARGET: 16,
    ERASING:   32,
};


Lumines.QuadBlock = function(blackPosition, specialPosition)
{
    this.rotate = 0;
    this.x = -1;
    this.y = -1;

    this.moving = false;

    this.block = new Array(2);
    this.block[0] = new Array(2);
    this.block[1] = new Array(2);

    this.blackPosition = blackPosition;
    if (this.blackPosition == null || 
        this.blackPosition == Lumines.QuadBlock.Position.EMPTY) {
        this.block[0][0] = null;
        this.block[1][0] = null;
        this.block[0][1] = null;
        this.block[1][1] = null;
        return;
    }

    var mask = 0x1;
    for (var y = 0; y < 2; y++) {
        for (var x = 0; x < 2; x++) {
            var color = Lumines.Block.Color.WHITE;
            if (blackPosition & mask) {
                color = Lumines.Block.Color.BLACK;
            }
            var isSpecial = false;
            if (specialPosition != null && (specialPosition & mask)) {
                isSpecial = true;
            }
            
            this.block[x][y] = new Lumines.Block(color, isSpecial);
            mask <<= 1;
        }
    }

};

Lumines.QuadBlock.prototype = {
    startMoving: function(x, y)
    {
        this.moving = true;
        this.x = (x != null) ? x : 0;
        this.y = (y != null) ? y : 0;

        for (var y = 0; y < 2; y++) {
            for (var x = 0; x < 2; x++) {
                this.block[x][y].moving();
            }
        }
    },

    rotateRight: function()
    {
        if (!this.moving)
            return;

        this.rotate--;
        if (this.rotate < 0){
            this.rotate = 3;
        }

        var tmp = this.block[0][0];
        this.block[0][0] = this.block[0][1];
        this.block[0][1] = this.block[1][1];
        this.block[1][1] = this.block[1][0];
        this.block[1][0] = tmp;
    },

    rotateLeft: function()
    {
        if (!this.moving)
            return;

        this.rotate++;
        if (this.rotate > 3){
            this.rotate = 0;
        }

        var tmp = this.block[0][0];
        this.block[0][0] = this.block[1][0];
        this.block[1][0] = this.block[1][1];
        this.block[1][1] = this.block[0][1];
        this.block[0][1] = tmp;
    },

    setBlockAt: function(block, position)
    {
        if (position == null)
            return;

        var x, y;
        if (position == Lumines.QuadBlock.Position.TOP_LEFT) {
            x = 0; y = 0;
        } else if (position == Lumines.QuadBlock.Position.TOP_RIGHT) {
            x = 1; y = 0;
        } else if (position == Lumines.QuadBlock.Position.BOTTOM_LEFT) {
            x = 0; y = 1;
        } else if (position == Lumines.QuadBlock.Position.BOTTOM_RIGHT) {
            x = 1; y = 1;
        } else {
            return;
        }

        if (block instanceof Lumines.Block) {
            this.block[x][y] = block;
        } else {
            this.block[x][y] = null;
        }
    },

    blockAt: function(position)
    {
        if (position == Lumines.QuadBlock.Position.TOP_LEFT)
            return this.block[0][0];
        if (position == Lumines.QuadBlock.Position.TOP_RIGHT)
            return this.block[1][0];
        if (position == Lumines.QuadBlock.Position.BOTTOM_LEFT)
            return this.block[0][1];
        if (position == Lumines.QuadBlock.Position.BOTTOM_RIGHT)
            return this.block[1][1];
        return null;
    },
};

Lumines.QuadBlock.Position = {
    EMPTY:       -1,
    NONE:         0,
    TOP_LEFT:     1,
    TOP_RIGHT:    2,
    BOTTOM_LEFT:  4,
    BOTTOM_RIGHT: 8,
};


Lumines.Field = function(width, height)
{
    this.width = (width != null) ? width : 16;
    this.height = (height != null) ? height : 10;

    this.field = new Array(this.width);
    for (var x = 0; x < this.width; x++) {
        this.field[x] = new Array(this.height);
    }

    this.clear();
};

Lumines.Field.prototype = {
    clear: function()
    {
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.field[x][y] = null;
            }
        }
    },

    setBlockAt: function(block, x, y)
    {
        if (x == null || y == null)
            return;
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return;

        if (block instanceof Lumines.Block) {
            this.field[x][y] = block;
        } else {
            this.field[x][y] = null;
        }
    },

    blockAt: function(x, y)
    {
        if (x == null || y == null)
            return null;
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return null;

        return this.field[x][y];
    },

    hasQuadSpaceAt: function(x, y)
    {
        if (x < 0 || y < -2 || x >= this.width - 1 || y >= this.height - 1)
            return false;

        if (this.blockAt(x, y) != null || this.blockAt(x + 1, y) != null ||
            this.blockAt(x, y + 1) != null || this.blockAt(x + 1, y + 1) != null)
            return false;

        return true;
    },

    updateBlockState: function()
    {
        var fallingBlocks = new Array();
        for (var x = 0; x < this.width; x++) {
            var isGrounding = true;
            for (var y = this.height - 1; y >= 0; y--) {
                if (this.field[x][y] != null) {
                    if (isGrounding) {
                        this.field[x][y].grounding();
                    } else {
                        this.field[x][y].falling();
                        this.field[x][y].x = x;
                        this.field[x][y].y = y;
                        fallingBlocks.push(this.field[x][y]);
                    }
                } else {
                    isGrounding = false;
                }
            }
        }

        var targetBlocks = new Array();
        for (var x = this.width - 2; x >= 0; x--) {
            for (var y = this.height - 2; y >= 0; y--) {
                if (this.field[x][y] == null || this.field[x][y + 1] == null ||
                    this.field[x + 1][y] == null || this.field[x + 1][y + 1] == null)
                    break;
                var color = this.field[x][y].color;
                if (this.field[x][y + 1].color == color &&
                    this.field[x + 1][y].color == color &&
                    this.field[x + 1][y + 1].color == color) {
                    this.field[x][y].target();
                    this.field[x][y + 1].target();
                    this.field[x + 1][y].target();
                    this.field[x + 1][y + 1].target();
                    
                    var block = new Lumines.QuadBlock();
                    var P = Lumines.QuadBlock.Position;
                    block.setBlockAt(this.field[x][y], P.TOP_LEFT);
                    block.setBlockAt(this.field[x + 1][y], P.TOP_RIGHT);
                    block.setBlockAt(this.field[x][y + 1], P.BOTTOM_LEFT);
                    block.setBlockAt(this.field[x + 1][y + 1], P.BOTTOM_RIGHT);
                    block.x = x;
                    block.y = y;

                    targetBlocks.push(block);
                }
            }
        }

        return {fallingBlocks: fallingBlocks, targetBlocks: targetBlocks};
    },

    fallBlockFrom: function(x, y)
    {
        if (x == null || y == null)
            return false;

        if (x < 0 || y < 0 || x >= this.width || y >= this.height - 1)
            return false;
        if (this.field[x][y] == null)
            return false;
        if (!this.field[x][y].isFalling())
            return false;
        if (this.field[x][y + 1] != null)
            return false;

        this.field[x][y + 1] = this.field[x][y];
        this.field[x][y] = null;
        return true;
    },
};


Lumines.NextBlockGenerator = function()
{
    this.nextBlocks = new Array();
};

Lumines.NextBlockGenerator.prototype = {
    blockAt: function(index)
    {
        if (index >= 0 && index < this.nextBlocks.length) {
            return this.nextBlocks[index];
        }
        return null;
    },
    
    pushNextBlock: function(block)
    {
        if (block instanceof Lumines.QuadBlock) {
            this.nextBlocks.push(block);
        }
    },

    popNextBlock: function()
    {
        if (this.nextBlocks.length > 0) {
            return this.nextBlocks.shift();
        }
        return null;
    },
};


Lumines.RandomBlockGenerator = function()
{
    Lumines.NextBlockGenerator.apply(this, arguments);

    this.pushRandomBlock();
    this.pushRandomBlock();
    this.pushRandomBlock();
};

Lumines.RandomBlockGenerator.prototype = new Lumines.NextBlockGenerator();

Lumines.RandomBlockGenerator.prototype.popNextBlock = function()
{
    this.pushRandomBlock();
    return Lumines.NextBlockGenerator.prototype.popNextBlock.call(this);
};

Lumines.RandomBlockGenerator.prototype.pushRandomBlock = function()
{
    var block = new Lumines.QuadBlock(Math.floor(Math.random() * 16));
    this.pushNextBlock(block);
};


Lumines.Stage = function(field, generator)
{
    if (field == null || !(field instanceof Lumines.Field))
        field = new Lumines.Field();
    this.field = field;

    if (generator instanceof Lumines.NextBlockGenerator)
        this.nextBlockGenerator = generator;

    this.movingBlock = null;
    this.timeline = -1;
    
    this.updatedBlocks = null;
};

Lumines.Stage.prototype = {
    start: function()
    {
        this.timeline = 0;
        this.updatedBlocks = this.field.updateBlockState();
        this.appearNextBlock();
    },

    appearNextBlock: function()
    {
        if (this.nextBlockGenerator != null) {
            var block = this.nextBlockGenerator.popNextBlock();
            if (block != null) {
                block.startMoving(Math.floor(this.field.width / 2) - 1, -2);
                this.movingBlock = block;
            } else {
                this.movingBlock = null;
            }
        }
    },

    rotateRight: function()
    {
        if (this.movingBlock == null)
            return false;

        this.movingBlock.rotateRight();
        return true;
    },

    rotateLeft: function()
    {
        if (this.movingBlock == null)
            return false;

        this.movingBlock.rotateLeft();
        return true;
    },

    moveRight: function()
    {
        if (this.movingBlock == null)
            return false;

        if (!this.field.hasQuadSpaceAt(this.movingBlock.x + 1, this.movingBlock.y))
            return false;

        this.movingBlock.x++;
        return true;
    },

    moveLeft: function()
    {
        if (this.movingBlock == null)
            return false;

        if (!this.field.hasQuadSpaceAt(this.movingBlock.x - 1, this.movingBlock.y))
            return false;

        this.movingBlock.x--;
        return true;
    },

    moveDown: function()
    {
        if (this.movingBlock == null)
            return false;

        var x = this.movingBlock.x;
        var y = this.movingBlock.y;

        if (!this.field.hasQuadSpaceAt(x, y + 1)) {
            if (y != -2) {
                return false;
            }
            if (this.field.hasQuadSpaceAt(x - 1, y + 1)) {
                this.movingBlock.x--;
            } else if (this.field.hasQuadSpaceAt(x + 1, y + 1)) {
                this.movingBlock.x++;
            } else {
                return false;
            }
        }

        this.movingBlock.y++;
        return true;
    },

    ground: function()
    {
        if (this.movingBlock == null)
            return false;

        var x = this.movingBlock.x;
        var y = this.movingBlock.y;

        if (y == -2)
            return false;
        
        var P = Lumines.QuadBlock.Position;
        if (y != -1) {
            this.field.setBlockAt(this.movingBlock.blockAt(P.TOP_LEFT), x, y);
            this.field.setBlockAt(this.movingBlock.blockAt(P.TOP_RIGHT), x + 1, y);
        }
        this.field.setBlockAt(this.movingBlock.blockAt(P.BOTTOM_LEFT), x, y + 1);
        this.field.setBlockAt(this.movingBlock.blockAt(P.BOTTOM_RIGHT), x + 1, y + 1);
        
        this.updatedBlocks = this.field.updateBlockState();

        return true;
    },

    fall: function(blocks)
    {
        var fallingBlocks = null;
        if (blocks != null) {
            fallingBlocks = blocks;
        } else if (this.updatedBlocks != null) {
            fallingBlocks = this.updatedBlocks.fallingBlocks;
        }
        if (fallingBlocks == null)
            return false;

        if (fallingBlocks.length == 0)
            return false;

        for (var i = 0; i < fallingBlocks.length; i++) {
            var block = fallingBlocks[i];
            this.field.fallBlockFrom(block.x, block.y);
        }

        this.updatedBlocks = this.field.updateBlockState();

        return true;
    },

    forwardTimeline: function()
    {
        var count = 0;
        for (var y = this.field.height - 1; y >= 0; y--) {
            var block = this.field.blockAt(this.timeline, y);
            if (block == null)
                break;
            
            if (block.erasing()) {
                count++;
            }
        }

        this.timeline++;

        if (count == 0 || this.timeline == this.field.width) {
            this.erase();
        }

        if (this.timeline == this.field.width) {
            this.timeline = 0;
        }
    },

    erase: function()
    {
        for (var x = 0; x < this.timeline; x++) {
            for (var y = this.field.height - 1; y >= 0; y--) {
                var block = this.field.blockAt(x, y);
                if (block == null)
                    break;

                if (block.isErasing()) {
                    this.field.setBlockAt(null, x, y);
                }
            }
        }

        this.updatedBlocks = this.field.updateBlockState();

        return true;
    },

    getCurrentData: function()
    {
        var data = {};

        data.field = this.field;
        data.movingBlock = this.movingBlock;
        data.timeline = this.timeline;
        data.fallingBlocks = this.updatedBlocks.fallingBlocks;
        data.targetBlocks = this.updatedBlocks.targetBlocks;

        var nextBlocks = Array();
        for (var i = 0; i < 3; i++) {
            nextBlocks.push(this.nextBlockGenerator.blockAt(i));
        }
        data.nextBlocks = nextBlocks;

        return data;
    },
};
