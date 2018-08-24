/**
 * @author Retromantis
 */

var PRESSED  = 1;
var MOVED    = 2;
var RELEASED = 3;

var DIR_NONE  = 0;
var DIR_LEFT  = 1;
var DIR_RIGHT = 2;
var DIR_UP    = 3;
var DIR_DOWN  = 4;

function loadAudio(filename, callback) {
    var audio = new Audio();
    audio.src = filename;
    audio.onload = callback;
    return audio;
}

function loadImage(filename, callback) {
    var image = new Image();
    image.src = filename;
    image.onload = callback;
    return image;
}

function initApplication(div_canvas, canvas_width, canvas_height, game_width, game_height, smooth) {

    WINDOW_WIDTH = window.innerWidth;
    WINDOW_HEIGHT = window.innerHeight;
    
    CANVAS_WIDTH = WINDOW_WIDTH;
    CANVAS_HEIGHT = WINDOW_HEIGHT;

    if(canvas_width) {
        CANVAS_WIDTH = canvas_width;
    }
    if(canvas_height) {
        CANVAS_HEIGHT = canvas_height;
    }

    GAME_WIDTH  = CANVAS_WIDTH;
    GAME_HEIGHT = CANVAS_HEIGHT

    if(game_width) {
        GAME_WIDTH = game_width;
    }
    if(game_height) {
        GAME_HEIGHT = game_height;
    }

    if(CANVAS_WIDTH > WINDOW_WIDTH) CANVAS_WIDTH = WINDOW_WIDTH;
    if(CANVAS_HEIGHT > WINDOW_HEIGHT) CANVAS_HEIGHT = WINDOW_HEIGHT;

    canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.style.background = "#000000";

    canvas.addEventListener("mousedown", mouseDownListener, false);
    canvas.addEventListener("mousemove", mouseMoveListener, false);
    canvas.addEventListener("mouseup", mouseUpListener, false);
    canvas.addEventListener("touchstart", touchStartListener, false);
    canvas.addEventListener("touchmove", touchMoveListener, false);
    canvas.addEventListener("touchend", touchEndListener, false);
    window.addEventListener("keydown", keyDownListener, false);
    window.addEventListener("keyup", keyUpListener, false);
    
    SCALE_WIDTH = canvas.width / GAME_WIDTH;
    SCALE_HEIGHT = canvas.height / GAME_HEIGHT;
    
    ctx = canvas.getContext('2d');
    ctx.scale(SCALE_WIDTH,SCALE_HEIGHT);

    if(smooth == false) {
        ctx.imageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;    
        ctx.mozImageSmoothingEnabled = false;
    }
    
    div_canvas = document.getElementById(div_canvas);
    div_canvas.appendChild(canvas);
    div_canvas.style.left = ((WINDOW_WIDTH - canvas.width) >> 1) + "px";
    div_canvas.style.top = ((WINDOW_HEIGHT - canvas.height) >> 1) + "px";

    clientRect = canvas.getBoundingClientRect();
    canvasX = clientRect.left;
    canvasY = clientRect.top;

    setInterval(run,50);
}

function run() {
    currscreen.onUpdate();
    currscreen.onDraw(ctx);
}

function mouseDownListener(event) {
    var x = (event.clientX - canvasX) / SCALE_WIDTH;
    var y = (event.clientY - canvasY) / SCALE_HEIGHT;
    currscreen.onTouch(this, PRESSED, x, y);
}

function mouseMoveListener(event) {
    var x = (event.clientX - canvasX) / SCALE_WIDTH;
    var y = (event.clientY - canvasY) / SCALE_HEIGHT;
    currscreen.onTouch(this, MOVED, x, y);
}

function mouseUpListener(event) {
    var x = (event.clientX - canvasX) / SCALE_WIDTH;
    var y = (event.clientY - canvasY) / SCALE_HEIGHT;
    currscreen.onTouch(this, RELEASED, x, y);
}

function touchStartListener(event) {
    event.preventDefault();
    var touch = event.changedTouches[0];
    currscreen.onTouch(this, PRESSED, touch.pageX, touch.pageY);
}

function touchMoveListener(event) {
    event.preventDefault();
    var touch = event.changedTouches[0];
    currscreen.onTouch(this, MOVED, touch.pageX, touch.pageY);
}

function touchEndListener(event) {
    event.preventDefault();
    var touch = event.changedTouches[0];
    currscreen.onTouch(this, RELEASED, touch.pageX, touch.pageY);
}

function keyDownListener(event) {
    currscreen.onKey(PRESSED, event.keyCode);
}

function keyUpListener(event) {
    currscreen.onKey(RELEASED, event.keyCode);
}

gotoScreen = function(screen) {
    if(screen instanceof NikScreen) {
        screen.onStart();
        currscreen = screen;
    }
}


/*
	NikRect
*/

function NikRect() {
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;    
}
    
NikRect.prototype.inBounds = function(px, py) {
    return ( (px >= this.x) && (px < (this.x + this.width)) && (py >= this.y) && (py < (this.y + this.height)));
}
   
NikRect.prototype.collidesWith = function(rect) {
    if( (this.x + this.width) <= rect.x ) return false;
    if( this.x >= (rect.x + rect.width) ) return false;
    if( (this.y + this.height) <= rect.y ) return false;
    return this.y < (rect.y + rect.height);
}


/*
	NikDrawable
*/

function NikDrawable() {
    this.parent = undefined;
    
    // content rectangle: x,y,width,height
    this.cx = 0;
    this.cy = 0;
    this.cwidth = 0;
    this.cheight = 0;
    
    // point/pin x,y
    this.px = 0;
    this.py = 0;
    
    // if drawable must be centered (x,y)
    this.centerX = 0;
    this.centerY = 0;
    
    // if implements NikTouchable
    this.nikTouchable = false;

    // if implements NikUpdateable
    this.nikUpdateable = false;
}

// NikDrawable extends NickRect
NikDrawable.prototype = Object.create(NikRect.prototype);

// if visible then draw it
NikDrawable.prototype.isDrawable = true;

NikDrawable.prototype.posXY = function(x, y) {
    this.x = this.px = x;
    if(this.centerX) {
        this.x -=(this.width >> 1);
    }
    this.y = this.py = y;
    if(this.centerY) {
        this.y -= (this.height >> 1);
    }
    this.cx = this.x;
    this.cy = this.y;
}
    
NikDrawable.prototype.moveXY = function(x, y) {
    this.posXY(this.px + x, this.py + y);
}

NikDrawable.prototype.onDraw = function(context) {}

NikDrawable.prototype.isUpdateable = function() {
    return this.isDrawable;
}

NikDrawable.prototype.onUpdate = function() {}

NikDrawable.prototype.isTouchable = function() {
    return this.isDrawable;
}

NikDrawable.prototype.onTouch = function(sender, event, x, y) {
    return false;
}


/*
    NikImage
*/

function NikImage(image) {
    this.image = image;
    this.x = 0;
    this.y = 0;
    this.width = this.image.width;
    this.height = this.image.height;
    this.cwidth = this.width;
    this.cheight = this.height;
}

NikImage.prototype = Object.create(NikDrawable.prototype);

NikImage.prototype.onDraw = function(context) {
    context.drawImage(this.image, this.x, this.y);        
}


/*
    NikSprite
*/

NikSprite = function(image, frameWidth, frameHeight) {
    this.x = 0;
    this.y = 0;
    // direction, horizontal speed, vertical speed
    this.dir = DIR_NONE;
    this.vx = 0;
    this.vy = 0;
    this.id = 0;

    this.image = image;
    this.bAnimated = false;

    this.frameCount;
    this.frameIndex;
    
    this.frameAnim = [];
    this.frameAnimIndex = 0;
    this.frameAnimCount = 0;
    this.frameAnimDelay = 0;
    this.frameAnimLoop = false;

    this.width = this.image.width;
    this.height = this.image.height;

    this.frameWidth = frameWidth || this.width;
    this.frameHeight = frameHeight || this.height;

    this.cols = Math.floor(this.width / this.frameWidth);
    this.rows = Math.floor(this.height / this.frameHeight);

    this.frameCount = this.cols*this.rows;
    this.frames = new Array(this.frameCount);
    for(var idx=0; idx<this.frameCount; idx++) {
        this.frames[idx] = new Array(8);
    }
    idx = 0;
    for(var row=0, ofsy=0; row < this.rows; row++, ofsy+=this.frameHeight) {
        for(var col=0, ofsx=0; col < this.cols; col++, ofsx+=this.frameWidth) {
            this.frames[idx][0] = ofsx;
            this.frames[idx][1] = ofsy;
            this.frames[idx][2] = this.frameWidth;
            this.frames[idx][3] = this.frameHeight;
            this.frames[idx][4] = 0;
            this.frames[idx][5] = 0;
            this.frames[idx][6] = this.frameWidth;
            this.frames[idx][7] = this.frameHeight;
            idx++;
        }
    }
        
    this.width = frameWidth;
    this.height = frameHeight;
    this.cwidth = this.width;
    this.cheight = this.height;
    this.frameIndex = 0;
}

NikSprite.prototype = Object.create(NikDrawable.prototype);

NikSprite.prototype.getFrameWidth = function(){
    return this.frames[this.frameIndex][2];
}

NikSprite.prototype.getFrameHeight = function(){
    return this.frames[this.frameIndex][3];
}

NikSprite.prototype.setAnimation = function(animation, delay, loop) {
    this.frameAnimLoop = loop;
    this.frameAnimIndex = 0;
    if(animation == null) {
        this.frameAnim = new Array(this.frameCount);
        for(var idx=0; idx < this.frameCount; idx++) {
            this.frameAnim[idx] = idx;
        }
    } else {
        this.frameAnim = animation;
    }
    this.frameIndex = this.frameAnim[this.frameAnimIndex];
    this.updateCollisionRect();
    this.bAnimated = this.frameAnim.length > 1;
    this.frameAnimDelay = delay;
}
    
NikSprite.prototype.setFrame = function(index, fromSeq) {
    if(fromSeq && this.frameAnim != null) {
        this.frameAnimIndex = index;
        this.frameIndex = this.frameAnim[this.frameAnimIndex];
    } else {
        this.frameIndex = index;
    }
    this.updateCollisionRect();
}

NikSprite.prototype.getFrame = function(fromAnim) {
    if(fromAnim && this.frameAnim != null) {
        return this.frameAnim[this.frameAnimIndex];
    } else return this.frameIndex;
}

NikSprite.prototype.nextFrame = function() {
    if(this.bAnimated) {
        if(this.frameAnimCount > this.frameAnimDelay) {
            this.frameAnimCount = 0;
            if(this.frameAnimIndex < (this.frameAnim.length - 1)) {
                this.frameAnimIndex++;
            } else if(this.frameAnimLoop) {
                this.frameAnimIndex = 0;
            } else {
                this.onEndAnimation(this.frameAnim);
            }
            this.frameIndex = this.frameAnim[this.frameAnimIndex];
            this.updateCollisionRect();
        } else {
            this.frameAnimCount++;
        }
    }
}
    
NikSprite.prototype.onEndAnimation = function(animation) {}

NikSprite.prototype.onDraw = function(context) {
    if(this.isDrawable && this.frameIndex >= 0) {
        context.drawImage(this.image,this.frames[this.frameIndex][0],this.frames[this.frameIndex][1],
            this.frames[this.frameIndex][2],this.frames[this.frameIndex][3],this.x,this.y,
                this.frames[this.frameIndex][2],this.frames[this.frameIndex][3]);

        // context.fillStyle="#00FF00";
        // context.fillRect(this.cx,this.cy,this.cwidth,this.cheight);
    }
}

NikSprite.prototype.onUpdate = function() {}

NikSprite.prototype.posXY = function(x,y) {
    this.x = this.px = x;
    if(this.centerX) {
        this.x -= (this.frames[this.frameIndex][2] >> 1);
    }
    this.y = this.py = y;
    if(this.centerY) {
        this.y -= (this.frames[this.frameIndex][3] >> 1);
    }
    this.updateCollisionRect();
}

NikSprite.prototype.setCollisionRect = function(x, y, width, height) {
    for(var idx=0; idx < this.frameCount; idx++) {
        this.frames[idx][4] = x;
        this.frames[idx][5] = y;
        this.frames[idx][6] = width;
        this.frames[idx][7] = height;
    }
    this.updateCollisionRect();
}

NikSprite.prototype.updateCollisionRect = function() {
    if(this.frameIndex >= 0) {
        this.cx = this.x + this.frames[this.frameIndex][4];
        this.cy = this.y + this.frames[this.frameIndex][5];
        this.cwidth  = this.frames[this.frameIndex][6];
        this.cheight = this.frames[this.frameIndex][7];
    }
}

NikSprite.prototype.inBounds = function(x,y) {
    return ( (x >= this.cx) && (x < (this.cx+this.cwidth)) && (y >= this.cy) && (y < (this.cy+this.cheight)));
}

NikSprite.prototype.collidesWith = function(rect) {
    if( (this.cx + this.cwidth) <= rect.cx ) return false;
    if( this.cx >= (rect.cx + rect.cwidth) ) return false;
    if( (this.cy + this.cheight) <= rect.cy ) return false;
    return this.cy < (rect.cy + rect.cheight);
}


/*
    NikButton
*/

NikButton = function(image, frameWidth, frameHeight) {
    NikSprite.call(this,image, frameWidth, frameHeight);
    this.nikTouchable =  true;
}

NikButton.prototype = Object.create(NikSprite.prototype);

NikButton.prototype.onTouch = function(sender, event, x, y) {
    var res = false;
    switch(event) {
        case PRESSED:
            if(this.inBounds(x,y)) {
                this.click = true;
                this.setFrame(1,false);
                res = true;
            }
            break;
        case RELEASED:
            if(this.click) {
                this.click = false;
                this.setFrame(0,false);
                res = true;
                this.onUpdate();
            }
            break;
    }
    return res;
}


/*
    NikText
*/

function NikText(font) {
    this.font = font;
    this.text = '';
    this.x = 0;
    this.y = 0;
    this.style = 'black';
    this.align = 'left';
    this.baseline = 'top';
}

NikText.prototype = Object.create(NikDrawable.prototype);

NikText.prototype.onDraw = function(context) {
    context.font = this.font;
    context.fillStyle = this.style;
    context.textAlign = this.align;
    context.textBaseline = this.baseline;
    context.fillText(this.text, this.x,this.y);
}


/*
	NikRunnable
*/

function NikRunnable() {}

NikRunnable.prototype.run = function(sender) {}


/*
    NikLayer
*/

function NikLayer() {
    this.width = 0;//parent.width;
    this.height = 0;//parent.height;
}

NikLayer.prototype = Object.create(NikDrawable.prototype);

NikLayer.prototype.nDrawables   = 0;
NikLayer.prototype.nUpdateables = 0;
NikLayer.prototype.nTouchables  = 0;

NikLayer.prototype.drawables   = [];
NikLayer.prototype.updateables = [];
NikLayer.prototype.touchables  = [];
    
NikLayer.prototype.nikUpdateable = true;
NikLayer.prototype.nikTouchable  = true;

NikLayer.prototype.onCreate = function() {}

NikLayer.prototype.add = function(child) {
    if(child instanceof NikDrawable) {
        child.parent = this;
        this.drawables.push(child);
        this.nDrawables++;

        if(child.nikUpdateable) {
            this.updateables.push(child);
            this.nUpdateables++;
        }

        if(child.nikTouchable) {
            this.touchables.push(child);
            this.nTouchables++;
        }
    }
}
    
NikLayer.prototype.onDraw = function(context) {
    for(var idx=0; idx < this.nDrawables; idx++) {
        drawable = this.drawables[idx];
        if(drawable.isDrawable) {
            drawable.onDraw(context);
        }
    }
}

NikLayer.prototype.onUpdate = function() {
    for(var idx=0; idx < this.nUpdateables; idx++) {
        updateable = this.updateables[idx];
        if(updateable.isUpdateable()) {
            updateable.onUpdate();
        }
    }
}

NikLayer.prototype.onTouch = function(sender, event, x, y) {
    var res = false;
    for(var idx=0; idx < this.nTouchables; idx++) {
        touchable = this.touchables[idx];
        if(touchable.isTouchable()) {
            if(res = touchable.onTouch(touchable, event, x, y)) {
                break;
            }
        }
    }
    return res;
}


/*
    NikScreen
*/

function NikScreen() {
    this.drawables   = [];
    this.updateables = [];
    this.touchables  = [];
}

NikScreen.prototype = Object.create(NikLayer.prototype);

NikScreen.prototype.onStart = function() {}

NikScreen.prototype.onKey = function(keyEvent, keyCode) {}

NikScreen.prototype.onBack = function() {}

