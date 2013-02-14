var Lumines = Lumines || {};


Lumines.Player = function(canvas, width, height)
{
    if (canvas != null) {
        this.field = new Lumines.Field(width, height);
        this.view = new Lumines.StageView(canvas, this.field.width, this.field.height, 16);
    }

    this.originalField = new Lumines.Field(width, height);
    this.originalNextBlocks = new Array();
    this.originalOperations = new Array();
};

Lumines.Player.prototype = {
    start: function()
    {
        this.field.clear();
        for (var y = 0; y < this.field.height; y++) {
            for (var x = 0; x < this.field.width; x++) {
                var block = this.originalField.blockAt(x, y);
                if (block != null) {
                    var color = block.color;
                    this.field.setBlockAt(new Lumines.Block(color), x, y);
                }
            }    
        }
    
        var generator = new Lumines.NextBlockGenerator();
        for (var i = 0; i < this.originalNextBlocks.length; i++) {
            var blackPosition = this.originalNextBlocks[i].blackPosition;
            generator.pushNextBlock(new Lumines.QuadBlock(blackPosition));
        }
    
        this.operations = new Array();
        for (var i = 0; i < this.originalOperations.length; i++) {
            this.operations.push(this.originalOperations[i]);
        }
    
        this.stage = new Lumines.Stage(this.field, generator);
    
        this.stage.start();

        this.draw();

        this.startTimer();
    },

    startTimer: function()
    {
        clearInterval(this.operationTimer);
        this.operationTimer = this.doNextOperation.applyInterval(1000, this);
    },

    stopTimer: function()
    {
        clearInterval(this.operationTimer);
    },

    rotateRight: function()
    {
        if (this.stage.rotateRight()) {
            this.draw();
            return true;
        }
        return false;
    },

    rotateLeft: function()
    { 
        if (this.stage.rotateLeft()) {
            this.draw();
            return true;
        }
        return false;
    },

    moveRight: function()
    {
        if (this.stage.moveRight()) {
            this.draw();
            return true;
        }
        return false;
    },

    moveLeft: function()
    {
        if (this.stage.moveLeft()) {
            this.draw();
            return true;
        }
        return false;
    },
    
    moveDown: function()
    {
        if (this.stage.moveDown()) {
            this.draw();
            return true;
        }

        if (this.stage.ground()) {
            this.stage.appearNextBlock();
            this.draw();
            this.fall();
        } else {
            this.stopTimer();
        }
        return false;
    },

    fall: function()
    {
        this.stopTimer();

        if (this.stage.fall()) {
            this.draw();
            this.fall.applyTimeout(50, this);
        } else {
            this.startTimer();
        }
    },

    hardDrop: function()
    {
        this.stopTimer();

        if (this.moveDown()) {
            this.hardDrop.applyTimeout(50, this);
        } else {
            this.startTimer();
        }
    },

    timeline: function()
    {
        this.stopTimer();

        var timelinePos = this.stage.timeline;
        this.stage.forwardTimeline();
        this.draw();
        this.fall();

        if (timelinePos < this.field.width - 1) {
            this.timeline.applyTimeout(100, this);
        } else {
            this.startTimer();
        }
    },

    doNextOperation: function()
    {
        if (this.operations.length > 0) {
            var func = this.operations.shift();
            func.apply(this);
        }
    },

    setBlockAt: function(block, x, y)
    {
        this.originalField.setBlockAt(block, x, y);
    },

    pushNextBlock: function(block)
    {
        this.originalNextBlocks.push(block);
    },

    pushOperation: function(operation)
    {
        this.originalOperations.push(operation);
    },

    draw: function()
    {
        this.view.draw(this.stage.getCurrentData());
    },
};


Function.prototype.applyTimeout = function(ms, self, args)
{
    var f = this;
    return setTimeout(function() {
            f.apply(self, args);
        }, ms);
};

Function.prototype.applyInterval = function(ms, self, args)
{
    var f = this;
    return setInterval(function() {
            f.apply(self, args);
        }, ms);
};

