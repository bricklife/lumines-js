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
    this.speed = 1;
};

Lumines.Player.prototype = {
    setSpeed: function(speed)
    {
        if (speed > 0) {
            this.speed = speed;
        }
    },

    reset: function()
    {
        this.field.clear();
        for (var y = 0; y < this.field.height; y++) {
            for (var x = 0; x < this.field.width; x++) {
                var block = this.originalField.blockAt(x, y);
                if (block != null) {
                    this.field.setBlockAt(new Lumines.Block(block.color, block.hasSpecial), x, y);
                }
            }    
        }
    
        var generator = new Lumines.NextBlockGenerator();
        for (var i = 0; i < this.originalNextBlocks.length; i++) {
            var blackPosition = this.originalNextBlocks[i].blackPosition;
            var specialPosition = this.originalNextBlocks[i].specialPosition;
            generator.pushNextBlock(new Lumines.QuadBlock(blackPosition, specialPosition));
        }
    
        this.operations = new Array();
        for (var i = 0; i < this.originalOperations.length; i++) {
            this.operations.push(this.originalOperations[i]);
        }
    
        this.stage = new Lumines.Stage(this.field, generator);

        clearInterval(this.fallTimer);
        clearInterval(this.hardDropTimer);
        clearInterval(this.timelineTimer);

        this.stage.start();

        this.draw();
    },

    start: function()
    {
        this.reset();

        this.pausing = false;

        this.fall();

        this.startTimer();
    },

    startTimer: function()
    {
        if (this.pausing == false) {
            clearInterval(this.operationTimer);
            this.operationTimer = this.doNextOperation.applyInterval(1000 / this.speed, this);
        }
    },

    stopTimer: function()
    {
        clearInterval(this.operationTimer);
    },

    pause: function()
    {
        this.pausing = true;
        this.stopTimer();
    },

    resume: function()
    {
        this.pausing = false;
        this.startTimer();
    },

    isPausing: function()
    {
        return this.pausing;
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
            this.fallTimer = this.fall.applyTimeout(50 / this.speed, this);
        } else {
            this.startTimer();
        }
    },

    hardDrop: function()
    {
        this.stopTimer();

        if (this.moveDown()) {
            this.hardDropTimer = this.hardDrop.applyTimeout(50 / this.speed, this);
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
            this.timelineTimer = this.timeline.applyTimeout(250 / this.speed, this);
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

