'use strict'
let buttonPressed = false,
    gameStart = false;
const flags = {
    managerSpawned: false,
    colorsNeeded: 5,
    gameEnded: 0,

}
function darkenHexColor(hex, percent) {
    // Remove the '#' symbol if it exists
    hex = hex.replace(/^#/, '');

    // Parse the hex color components
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Calculate the darker color components
    r = Math.round(r * (1 - percent / 100));
    g = Math.round(g * (1 - percent / 100));
    b = Math.round(b * (1 - percent / 100));

    // Ensure the values are within the valid range
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    // Convert the darker color components back to hex
    return '#' + [r, g, b].map(c => {
        // Convert each component to a two-digit hex string
        const hex = c.toString(16);
        // Pad the string with a leading '0' if necessary
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}
class entity {
    static all = []
    static tokill = []
    static particles = []
    static startPos = {
        x: 0,
        y: 0
    }
    static clear = function (type) {
        for (let o of entity.all) {
            if (!o.isPlayer) {
                o.invuln = false
                o.o = 0
                o.kill(type)
            }
        }
    }
    constructor(x, y, size, shape) {
        this.x = x || 0;
        this.y = y || 0;
        this.shape = shape;
        this.coinsNeeded = 0;

        this.goesBackToStart = false
        this.maxHp = 1;
        this.activated = false;
        this.hp = this.maxHp
        this.size = size || 1;
        this.frozen = false;
        this.damage = 1
        this.maxSpeed = this.speed
        this.rot = this.weight = 0
        this.invuln = false
        this.edgeType = ''
        this.guns = []
        this.col = {
            r: 0,
            g: 0,
            b: 0
        }
        this.o = 10
        this.speed = this.width = this.height = 1
        this.color = '#000000'
        this.firing = false;
        this.invincible = false;
        this.fp = {
            x: this.x,
            y: this.y
        }

        this.velocity = {
            x: 0,
            y: 0,
            a: 0, //angular velocity
        }
        this.start = {
            x: this.x,
            y: this.y,
            rot: this.rot,
            color: this.color,
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y,
                a: this.velocity.a
            },
            speed: this.speed,
            size: this.size,
        }
        this.moving = [false, false, false, false]
        entity.all.push(this) //we now exist according to the game
    }
    kill() {
        if (this.invuln) { return }
        this.invuln = true
        entity.tokill.push(this) //instead of destroying instantly like in the (buggy) code below, i get put in an array of
        //shapes to be killed at the end of the frame instead 😝
        //all.splice(all.indexOf(this), 1)
    }
    teleport(x, y) {
        this.x = this.fp.x = x;
        this.y = this.fp.y = y
    }
    newPos() {
        if (entity.all.indexOf(player) < 0 && this !== player) {
            this.onPlayerDied?.()
        }
        if (this.grows) {
            this.size += this.grows
        }
        // this.velocity.y+=1
        /*   for (const obj of all) {
            if (obj === this) {
             continue
            }
  
           }*/
        //this.velocity.a/= 1.01
        //move me
        if (this.hp <= 0) {
            this.kill()
        }
        if (this.firing) {
            for (let o of this.guns) {
                o.fire()
            }
        }
        if (buttonPressed&&!this.activated) {
            this.activated=true
            this.activate?.('on')
        }
        else if (!buttonPressed&&this.activated) {
            this.activated=false
            this.activate?.('off')
        }
        if (this.isPlayer) {
            if (this.moving[1] && !this.moving[0]) {
                this.velocity.y = this.speed
            } else if (!this.moving[1] && this.moving[0]) {
                this.velocity.y = -this.speed
            } else {
                this.velocity.y = 0
            }
            if (this.moving[2] && !this.moving[3]) {
                this.velocity.x = this.speed
            } else if (!this.moving[2] && this.moving[3]) {
                this.velocity.x = -this.speed
            } else {
                this.velocity.x = 0
            }
        }
        if (this.velocity.x > this.speed * this.maxSpeed) { this.velocity.x = this.speed * this.maxSpeed }
        if (this.velocity.x < -this.speed * this.maxSpeed) { this.velocity.x = -this.speed * this.maxSpeed }
        if (this.velocity.y > this.speed * this.maxSpeed) { this.velocity.y = this.speed * this.maxSpeed }
        if (this.velocity.y < -this.speed * this.maxSpeed) { this.velocity.y = -this.speed * this.maxSpeed }

        this.fp.x += this.velocity.x / runSpeed;
        this.fp.y += this.velocity.y / runSpeed;
        if (!isFinite(this.fp.x) || !isFinite(this.fp.y) && !this.invuln && !this.invincible) {
            this.kill()
        }
        if (this.fp.x < this.size && !this.invuln && !this.invincible) {

            if (this.isPlayer) { this.fp.x = this.size }
            else if (this.edgeType === 'bounce') {
                this.velocity.x = -this.velocity.x;
                this.fp.x += this.velocity.x;
            }
            else if (this.edgeType === 'stick') {
                this.velocity.x = 0;

            }
            else {
                this.kill()
            }
        }
        if (this.fp.x > cwidth - this.size && !this.invuln && !this.invincible) {
            if (this.isPlayer) { this.fp.x = cwidth - this.size }
            else if (this.edgeType === 'bounce') {
                this.velocity.x = -this.velocity.x;
                this.fp.x += this.velocity.x;
            }
            else if (this.edgeType === 'stick') {
                this.velocity.x = 0;

            }
            else {
                this.kill()
            }
        }
        if (this.fp.y < this.size && !this.invuln && !this.invincible) {
            if (this.isPlayer) { this.fp.y = this.size }
            else if (this.edgeType === 'bounce') {
                this.velocity.y = -this.velocity.y
                this.fp.y += this.velocity.y
            } else if (this.edgeType === 'stick') {
                if (!(this instanceof block)) { this.velocity.y = 0; }

            }
            else {
                this.kill()
            }
        }
        if (this.fp.y > cheight - this.size && !this.invuln && !this.invincible) {
            if (this.isPlayer) { this.fp.y = cheight - this.size }
            else if (this.edgeType === 'bounce') {
                this.velocity.y = -this.velocity.y
                this.fp.y += this.velocity.y
            } else if (this.edgeType === 'stick') {

                this.velocity.y = 0;

            }
            else {
                this.kill()
            }
        }
        this.velocity.y += this.weight
        //this below is for looping across the screen sides
        //rotation

        this.rot += this.velocity.a / runSpeed

        // failsave for that one error
        if (this.size < 2) {
            this.kill()
        }
        //this.size -= 0.2
        for (let o of entity.all) {
            if (o === this) {
                continue
            } else if (entity.particles.indexOf(this) >= 0 || this.invincible) {
                break
            } else {
                let diff = {
                    x: Math.abs(o.x - this.x) - this.size,
                    y: Math.abs(o.y - this.y) - this.size
                }
                if (diff.x < o.size && diff.y < o.size && !this.invuln && !o.invuln) {
                    o.collide?.(this)
                }
            }
        }
        this.x = this.fp.x
        this.y = this.fp.y
    }
    draw( /*✏️*/) {
        if (!paused && !this.frozen) {
            this.newPos()
        }

        ctx.globalAlpha = this.o / 10;
        ctx.beginPath();
        ctx.lineWidth = 3.5
        ctx.save(); // saves the coordinate system
        let x = this.x,
            y = this.y,
            size = this.size
        ctx.translate(x, y); // now the position (0,0) is INSTEAD found at MY center!
        ctx.rotate(this.rot)
        ctx.save()
        for (let g of this.guns) {
            if (g.r < 1) {
                g.r += 0.08
            }
            ctx.strokeStyle = darkenHexColor(g.color, 60)

            ctx.rotate(g.angle)
            ctx.fillStyle = g.color
            ctx.moveTo(g.width + g.x, (g.length * g.r) + g.y)
            ctx.lineTo(-g.width + g.x, (g.length * g.r) + g.y)
            ctx.lineTo(-g.width + g.x, -(g.length * g.r) + g.y)
            ctx.lineTo(g.width + g.x, -(g.length * g.r) + g.y)
            ctx.fill()
            ctx.closePath()
            ctx.stroke()
        }

        ctx.restore()
        ctx.beginPath()
        ctx.strokeStyle = darkenHexColor(this.color, 60)

        ctx.fillStyle = this.color

        if (!this.shape) {
            //the circle
            ctx.arc(0, 0, this.size, 0, 2 * Math.PI);
            ctx.fill()
        } else if (this.shape === 3) {
            ctx.rotate(toRad(180))
            ctx.moveTo(0, -size)
            ctx.lineTo(-size * Math.sin(Math.PI / 3), size * Math.cos(Math.PI / 3)); // Move to the bottom left vertex
            ctx.lineTo(size * Math.sin(Math.PI / 3), size * Math.cos(Math.PI / 3)); // Move to the bottom right vertex

            ctx.fill()
            ctx.closePath()
        }
        else {
            ctx.rotate(toRad(45))
            ctx.moveTo(0 + (size * 1.4) * Math.cos(0), 0 + (size * 1.4) * Math.sin(0));
            for (var i = 1; i <= this.shape; i++) {
                ctx.lineTo(0 + (size * 1.4) * Math.cos(i * 2 * Math.PI / this.shape), 0 + (size * 1.4) * Math.sin(i * 2 * Math.PI / this.shape));
            }
            ctx.fill()
            ctx.closePath();
        }

        ctx.stroke()
        ctx.restore()
        /*ctx.font = "50px serif";
            ctx.fillStyle = '#000000'
        ctx.fillText(all.indexOf(this), this.x, this.y);
        */
        /* if (this.target) {
             ctx.beginPath()
             ctx.moveTo(this.x, this.y)
             ctx.lineTo(this.target.x, this.target.y)
             ctx.strokeStyle = this.color
             ctx.stroke()
         }*/
    }
}
class wall extends entity {
    constructor(x, y, size, shape) {
        super(x, y, size, shape)
        if (currentLevel < 5) {
            this.color = colors.blue
        }
    }
    collide(coll) {
        let myHit = {
            isPlayer: this === player,
            r: this.fp.x + this.size,
            l: this.fp.x - this.size,
            t: this.fp.y - this.size,
            b: this.fp.y + this.size
        }
        let collHit = {
            isPlayer: coll === player,
            r: coll.fp.x + coll.size,
            l: coll.fp.x - coll.size,
            t: coll.fp.y - coll.size,
            b: coll.fp.y + coll.size
        }
        let dis = {
            r: calc.ds(myHit.r, collHit.r),
            l: calc.ds(myHit.l, collHit.l),
            t: calc.ds(myHit.t, collHit.t),
            b: calc.ds(myHit.b, collHit.b),
        }
        // if (coll=== player) { console.log('MyHit:',myHit,'collHit:',collHit,'distance:',dis)}
        if (coll === player || coll instanceof box) {
            if (collHit.r - myHit.r >= this.size / 5 || -(collHit.l - myHit.l) >= this.size / 5) {
                coll.fp.x -= (calc.ds(this.x, coll.x) / this.size) * (this.size * (Math.abs(0.009 + (coll instanceof box ? -0.005 : 0.09))))
            }
            if (collHit.b - myHit.b >= this.size / 5 || -(collHit.t - myHit.t) >= this.size / 5) {
                coll.fp.y -= (calc.ds(this.y, coll.y) / this.size) * (this.size * (Math.abs(0.009 + (coll instanceof box ? -0.005 : 0.09))))
            }
        }
        else if (coll instanceof tracking) {
            coll.kill()
        }
        /* if (this.y > coll.y && coll.velocity.y > 0) {
                 coll.fp.y = coll.y
               }
               if (this.y < coll.y && coll.velocity.y < 0) {
                 coll.fp.y = coll.y
               }
               if (this.x > coll.x && coll.velocity.x > 0) {
                 coll.fp.x = coll.x
               }
               if (this.x < coll.x && coll.velocity.x < 0) {
                 coll.fp.x = coll.x
               }*/
    }
}
class enemy extends entity {
    constructor(x, y, size, shape) {
        super(x, y, size, shape)
    }
    collide(coll) {
        let myHit = {
            r: this.fp.x + this.size,
            l: this.fp.x - this.size,
            t: this.fp.y - this.size,
            b: this.fp.y + this.size
        }
        let collHit = {
            r: coll.fp.x + coll.size,
            l: coll.fp.x - coll.size,
            t: coll.fp.y - coll.size,
            b: coll.fp.y + coll.size
        }
        let dis = {
            r: calc.ds(myHit.r, collHit.r),
            l: calc.ds(myHit.l, collHit.l),
            t: calc.ds(myHit.t, collHit.t),
            b: calc.ds(myHit.b, collHit.b),
        }
        // if (coll=== player) { console.log('MyHit:',myHit,'collHit:',collHit,'distance:',dis)}
        if (coll instanceof wall) {
            if (collHit.r - myHit.r >= this.size + 45 || -(collHit.l - myHit.l) >= this.size + 45) {
                this.velocity.x = -this.velocity.x
                this.x += this.velocity.x
            }
            if (collHit.t - myHit.t >= this.size || -(collHit.b - myHit.b) >= this.size) {
                this.velocity.y = -this.velocity.y
                this.y += this.velocity.y
            }
        } else if (coll === player) {

            coll.kill()
        }            // player.teleport(entity.startPos.x,entity.startPos.y)

    }
}
class tracking extends enemy {
    constructor(x, y, size, shape) {
        super(x, y, size, shape)
        this.color = '#00e4ff'
        this.speed = 10

        this.maxSpeed = 0.5
        this.target = null
    }
    onPlayerDied() {
        this.kill()
    }
    newPos() {

        super.newPos()

        /*     if (player.x > this.fp.x) {this.velocity.x+=this.speed * 0.025}
             if (player.x < this.fp.x) {this.velocity.x-=this.speed * 0.025}
      if (player.y > this.fp.y) {this.velocity.y+=0.25}
             if (player.y < this.fp.y) {this.velocity.y-=0.25}
             if (Math.abs(this.velocity.x) > this.speed && this.velocity.x > 0) {this.velocity.x=this.speed}
             if (Math.abs(this.velocity.x) > this.speed && this.velocity.x < 0) {this.velocity.x=-this.speed}
             if (Math.abs(this.velocity.y) > this.speed && this.velocity.y > 0) {this.velocity.y=this.speed}
             if (Math.abs(this.velocity.y) > this.speed && this.velocity.y < 0) {this.velocity.y=-this.speed}
             */

        if (!this.target || entity.all.indexOf(this.target) < 0) {
            for (let o of entity.all) {
                if (o.isPlayer) {
                    this.target = o
                }
            }
        }
        else {
            let disx = this.target.x - this.x
            let disy = this.target.y - this.y
            let targ = -Math.atan2(disx, disy)
            let ang = targ - this.rot
            if (ang > Math.PI) {
                ang -= 2 * Math.PI
            }
            else if (ang < -Math.PI) {
                ang += 2 * Math.PI
            }
            let rotationSpeed = 0.08; // Adjust this value to control the rotation speed

            // Interpolate rotation gradually
            if (Math.abs(ang) > rotationSpeed) {
                this.rot += rotationSpeed * Math.sign(ang);
            } else {
                this.rot = targ;
            }
            this.velocity.x = -Math.sin(this.rot) * this.speed
            this.velocity.y = Math.cos(this.rot) * this.speed

        }
    }
    collide(coll) {
        let myHit = {
            r: this.fp.x + this.size,
            l: this.fp.x - this.size,
            t: this.fp.y - this.size,
            b: this.fp.y + this.size
        }
        let collHit = {
            r: coll.fp.x + coll.size,
            l: coll.fp.x - coll.size,
            t: coll.fp.y - coll.size,
            b: coll.fp.y + coll.size
        }
        let dis = {
            r: calc.ds(myHit.r, collHit.r),
            l: calc.ds(myHit.l, collHit.l),
            t: calc.ds(myHit.t, collHit.t),
            b: calc.ds(myHit.b, collHit.b),
        }
        // if (coll=== player) { console.log('MyHit:',myHit,'collHit:',collHit,'distance:',dis)}
        if (coll === player) {
            /* player.kill()
             this.kill()
             setTimeout(() => {
                 spawnPlayer(entity.startPos.x, entity.startPos.y)
             }, 200)*/
            coll.hp -= this.damage;
            this.hp -= coll.damage
            // player.teleport(entity.startPos.x,entity.startPos.y)
        }
        else if (coll.parent !== this.parent) {

            coll.hp -= this.damage;
            this.hp -= coll.damage
        }
        else if (coll instanceof tracking) {
            if (collHit.r - myHit.r >= this.size / 5 || -(collHit.l - myHit.l) >= this.size / 5) {
                coll.fp.x -= (calc.ds(this.x, coll.x) / this.size) * (this.size * (Math.abs(coll.velocity.x * 0.009)))
            }
            if (collHit.b - myHit.b >= this.size / 5 || -(collHit.t - myHit.t) >= this.size / 5) {
                coll.fp.y -= (calc.ds(this.y, coll.y) / this.size) * (this.size * (Math.abs(coll.velocity.y * 0.009)))
            }
        }
    }
}
class spawner extends enemy {
    constructor(x, y, size, shape) {
        super(x, y, size, shape)
        this.speed = 0
        this.fireInterval = 100
        this.fireTime = 0
        this.maxSpeed = 0

    }
    newPos() {
        super.newPos()
        this.velocity.a = 0.1
        this.fireTime++
        if (this.fireTime >= this.fireInterval) {
            this.fireTime = 0;
            this.fire()
        }
    }
    fire() {
        let f = new tracking(this.x, this.y, 7, 3)
        f.velocity.x = ran.range(-f.speed, f.speed)
        f.velocity.y = ran.range(-f.speed, f.speed)
        f.color = this.color
    }
    collide(coll) {
        if (coll === player) {
            coll.kill()


        }
    }
}
class box extends entity {
    constructor(x, y, size) {
        super(x, y, size)
        this.shape = 4;
        this.goesBackToStart = true
        this.color = '#965318'
    }
    onPlayerDied() {
        this.fp.x = this.start.x;
        this.fp.y = this.start.y

    }
    activate(type){
        if (type === 'on') {
this.velocity.y = 1
        }
        else if (type === 'off') {
this.velocity.y = -1
        }
    }
    kill(type) {
        if (!type) {
            let n = new box(this.x, this.y, this.size, this.shape)
            n.velocity.a = ran.range(-0.1, 0.1)
            n.kill(true)
            n.invuln = true

            this.fp.x = this.start.x;
            this.fp.y = this.start.y
        }
        else { super.kill() }
    }
    collide(coll) {
        if (coll instanceof checkPoint || coll instanceof bullet || coll instanceof button) { return }
        if (coll instanceof tracking) {
            coll.kill()
            return
        }
        if (coll instanceof enemy) {
            this.kill()
            return;
        }

        let myHit = {
            isPlayer: this === player,
            r: this.fp.x + this.size,
            l: this.fp.x - this.size,
            t: this.fp.y - this.size,
            b: this.fp.y + this.size
        }
        let collHit = {
            isPlayer: coll === player,
            r: coll.fp.x + coll.size,
            l: coll.fp.x - coll.size,
            t: coll.fp.y - coll.size,
            b: coll.fp.y + coll.size
        }
        let dis = {
            r: calc.ds(myHit.r, collHit.r),
            l: calc.ds(myHit.l, collHit.l),
            t: calc.ds(myHit.t, collHit.t),
            b: calc.ds(myHit.b, collHit.b),
        }

        if (collHit.r - myHit.r >= this.size / 5 || -(collHit.l - myHit.l) >= this.size / 5) {
            this.fp.x += (calc.ds(this.x, coll.x) / this.size) * (this.size * (Math.abs(0.009 + 0.10)))
        }
        if (collHit.b - myHit.b >= this.size / 5 || -(collHit.t - myHit.t) >= this.size / 5) {
            this.fp.y += (calc.ds(this.y, coll.y) / this.size) * (this.size * (Math.abs(0.009 + 0.10)))
        }
        if (coll === player) {
            if (collHit.r - myHit.r >= this.size / 5 || -(collHit.l - myHit.l) >= this.size / 5) {
                coll.fp.x -= (calc.ds(this.x, coll.x) / this.size) * (this.size * (Math.abs(0.009 + 0.07)))
            }
            if (collHit.b - myHit.b >= this.size / 5 || -(collHit.t - myHit.t) >= this.size / 5) {
                coll.fp.y -= (calc.ds(this.y, coll.y) / this.size) * (this.size * (Math.abs(0.009 + 0.07)))
            }
        }


    }
    draw() {
        super.draw()
        ctx.save()
        ctx.beginPath()
        ctx.lineWidth = 4
        ctx.strokeStyle = darkenHexColor(this.color, 60)
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rot)

        ctx.moveTo(0 - this.size, 0 - this.size)
        ctx.lineTo(0 + this.size, 0 + this.size)
        ctx.moveTo(0 - this.size, 0 + this.size)
        ctx.lineTo(0 + this.size, 0 - this.size)

        ctx.stroke()
        ctx.fill()
        ctx.restore()
    }
}
class checkPoint extends entity {
    constructor(x, y, size) {
        super(x, y, size)
        this.color = '#07f700'
        this.shape = 4

    }

    collide(coll) {
        if (coll === player) {
            if (!player.coinsNeeded) {
                player.o = 0
                entity.clear(true);

                text = messages[c++]
                setTimeout(() => {
                    if (level.next().done) {
                        let f = new enemy(cwidth / 2, cheight / 2, 10, 0); f.color = '#0700f7';
                        let n = new wall((cwidth / 2) + 40, cheight / 2, wallSize, 4)
                        new box((cwidth / 2) + 60, cheight / 2, 20)
                        new turret(600, 200, 20, '#ff5500', 100)
                        new button(700, 200, 10, null)
                        text = '(that was the last level for now)'
                        n.color = '#7a7a7a'
                    }
                    currentLevel++
                    text = ''
                    player.o = 10
                }, 1500)
            }
        }
    }
}
class bullet extends entity {
    constructor(speed, size, kb, shape, parent) {
        super()
        this.speed = speed;
        this.size = size;
        this.kb = kb;
        this.shape = shape
        this.parent = parent.parent


    }
    beforePlayerRespawn() {
        this.kill()
    }
    collide(coll) {

        switch (this.collisionType) {
            case 'damage':
                if (coll instanceof wall) { this.kill() }
                else if (coll === player) { this.kill(); coll.kill() }
                else if (coll instanceof box) { this.kill() }
                break;
        }

    }
}
class gun {
    constructor(angle, x, y, length, width, reload, color, parent, speed) {
        this.x = x || 0
        this.angle = angle
        this.y = y || 0
        this.length = length || 1
        this.width = width || 1;
        this.shape = 4
        this.speed = speed
        this.r = 1
        this.reload = reload || 1
        this.fireTime = this.reload;
        this.color = color

        this.parent = parent
        this.parent.guns.push(this)
    }
    fire(b) {
        if (this.fireTime >= this.reload) {
            this.r = 0.5
            this.fireTime = 0;
            let fired = new bullet(30, this.width * 0.85, 1, 0, this)
            fired.rot = this.parent.rot + this.angle; // Use gun's angle instead of parent's rotation
            let offsetX = (this.length * 2) * Math.cos(this.angle + this.parent.rot + toRad(90))  // Use gun's angle here as well
            let offsetY = (this.length * 2) * Math.sin(this.angle + this.parent.rot + toRad(90))  // Use gun's angle here as well
            offsetX += Math.sign(offsetX) * 3
            offsetY += Math.sign(offsetY) * 3
            fired.collisionType = this?.collisionType
            fired.velocity.x = this.speed * Math.cos(this.angle + this.parent.rot + toRad(90)); // Use gun's angle here as well
            fired.velocity.y = this.speed * Math.sin(this.angle + this.parent.rot + toRad(90)); // Use gun's angle here as well
            fired.fp.x = fired.x = this.parent.x + offsetX;
            fired.fp.y = fired.y = this.parent.y + offsetY;
            fired.color = this.parent.color

        }
    }

}
class turret extends entity {
    constructor(x, y, size, color, range) {
        super(x, y, size, color)
        this.shape = 4;
        this.color = color
        this.range = range
        this.goesBackToStart = true;
        let f = new gun(0, 0, 10, 20, 10, 40, this.color, this, 8)
        f.collisionType = 'damage'
        this.invuln = false;
    }

    collide(coll) {
        if (coll === player) {
            coll.kill()
        }
    }
    draw() {
        if (this.target) {
            ctx.beginPath()
            ctx.lineWidth = 1
            ctx.strokeStyle = '#F70005'
            ctx.moveTo(this.x, this.y)
            ctx.lineTo(this.target.x, this.target.y)

            ctx.stroke()
            ctx.fill()
        }
        super.draw()

    }
    newPos() {
        if (Math.abs(player.x - this.x) > this.range || Math.abs(player.y - this.y) > this.range) {
            this.target = null
            this.firing = false;
            //this.rot += 0.01
            return
        }
        this.firing = true;
        super.newPos()

        if (entity.all.indexOf(this.target) < 0) {
            this.target = player
        }


        else if (this.target) {


            let disx = player.x - this.x
            let disy = player.y - this.y
            let targ = -Math.atan2(disx, disy)
            let ang = targ - this.rot
            if (ang > Math.PI) {
                ang -= 2 * Math.PI
            }
            else if (ang < -Math.PI) {
                ang += 2 * Math.PI
            }
            if (Math.abs(ang) > 0.05) {
                this.rot += 0.05 * Math.sign(ang);
            } else {
                this.rot = targ;
            }
        }
    }
}
class button extends entity {
    constructor(x, y, size, func) {
        super(x, y, size)
        this.shape = 4;
    }
    collide(coll) {
        if (coll instanceof box || coll === player) {
            buttonPressed = true;
        }
    }
    newPos() {
        super.newPos()
        buttonPressed = false
    }
    draw() {
        if (buttonPressed) {
            this.color = '#34fa42'
            this.size = this.start.size * 0.9
        }
        else {
            this.color = '#ff5e5e'
            this.size = this.start.size
        }
        super.draw()
    }
}
class coin extends entity {
    constructor(x, y) {
        super(x, y)
        this.size = 8;
        this.color = '#d9fa02'
        this.shape = 0;
        this.goesBackToStart = true;
        player.coinsNeeded++
    }
    collide(coll) {
        if (coll === player) {
            this.o = 0;
            this.invuln = true;
            console.log('gotted')
            player.coinsNeeded--
        }
    }


}
class block extends entity {
    constructor(x, y, size) {
        super(x, y, size)
        this.color = ran.choose('#9327e6', '#e62767', '#3fe03f', '#d0e03f', '#e0853f')
        this.shape = 4;
        this.velocity.y = 7
        this.colorChosen = true;
        this.edgeType = 'stick'
    }
    newPos() {
        super.newPos();
        if (this.velocity.y === 0 && this.y < 230) {
            if (!gameStart) {
                console.log(gameStart = true)
            }
        }
    }
    draw() {
        super.draw()
        if (!this.colorChosen) {
            this.o = 0
        }
        else { this.o = 10 }
    }
    collide(coll) {
        if (coll instanceof block) {
            this.velocity.y = 0;
        }
        else if (coll === player && !this.colorChosen) {
            player.kill()
        }
    }
}
class manager extends entity {
    constructor(x, y) {
        super(x, y)
        this.size = 13
        this.invuln = true;
        this.color = '#000b9e'
        this.chosen = null
        
        this.shape = 4
        this.velocity.y = 4
        this.timers = {
            pickTime: new timer(150),
            moveTime: new timer(200),
            cycleTime: new timer(100),

        }
   
        flags.managerSpawned = true;
    }
    choose(color, final) {
        if (color === this.chosen && !final) {
            return this.choose(ran.choose('#9327e6', '#e62767', '#3fe03f', '#d0e03f', '#e0853f'))
        }
        if (!final) {
            for (let o of entity.all) {
                if (o instanceof block) {
                    o.colorChosen = true;
                }
            }
            this.color = this.chosen = color;

        }
        else {
            for (let o of entity.all) {
                if (!(o instanceof block)) {
                    continue
                }
                else {
                    if (o.color !== color) {
                        o.colorChosen = false;
                    }
                }
            }
        }
    }
    beforePlayerRespawn() {
        flags.colorsNeeded = 5;
        this.timers.pickTime.reset()
        this.timers.moveTime.reset(200)
        this.color = '#000b9e'
        for (let o of entity.all) {
            if (o instanceof block) {
                o.colorChosen = true
            }
        }
    }
    newPos() {
        super.newPos()
        if (this.y > 100 || flags.init) {
            flags.init = true;
            this.velocity.y = 0
        }
        if (!this.velocity.y && !this.timers.pickTime.done) {
            this.timers.pickTime.tick()
            

        }
        if (flags.colorsNeeded !== 0) {
            if (this.timers.pickTime.done && !this.timers.moveTime.time) {
                this.choose(ran.choose('#9327e6', '#e62767', '#3fe03f', '#d0e03f', '#e0853f'))
               
            }
            if (this.timers.pickTime.done && !this.timers.moveTime.done) {
                this.timers.moveTime.tick()
            }
            if (this.timers.moveTime.done && this.timers.pickTime.done) {            
                this.timers.moveTime.reset(40+(flags.colorsNeeded * 30))
                this.timers.pickTime.reset()
                this.choose(this.chosen, true)
                flags.colorsNeeded--
            }
        }
        else {
            if (flags.gameEnded < 100) {
                flags.gameEnded++;

            }
            else if (flags.gameEnded === 100) {
                new checkPoint(1200, this.y + 400, 40)
                flags.gameEnded++
                for (let o of entity.all) {
                    if (o instanceof block) {
                        o.colorChosen = true
                    }
                }
            }
            if (flags.gameEnded === 101) {
                this.timers.cycleTime.tick()
                if (this.timers.cycleTime.done) {
                    let d = []
                    this.timers.cycleTime.reset()
                    for (let o of entity.all) {
                        if (o instanceof block) {
                            d.push(o)
                        }
                    }
                    for (let i = 0; i < d.length; i++) {
                        switch (d[i].color) {
                            case '#ff6b6b':
                                d[i].color = '#6b93ff'
                                break;

                            case '#6b93ff':
                                d[i].color = '#ff6b6b'
                                break;


                        }

                        if (d[i].color !== '#ff6b6b' && d[i].color !== '#6b93ff') i % 2 === 1 ? d[i].color = '#ff6b6b' : d[i].color = '#6b93ff'
                    }
                }
            }
        }
    }
    draw() {
        super.draw()
        if (flags.colorsNeeded === 5) {
            ctx.beginPath()
            ctx.save()
            ctx.translate(this.x, this.y)
            ctx.strokeStyle = '#ff0000'
            ctx.moveTo(0, -20)

            ctx.lineTo(0, -80)
            ctx.moveTo(0, -20)
            ctx.lineTo(10, -35)
            ctx.moveTo(0, -20)
            ctx.lineTo(-10, -35)

            ctx.stroke()
            ctx.restore()
        }
    }
}
class timer {
    constructor(limit, func) {
        this.limit = +(limit-1) || 1
        this.time = 0;
        this.func = func
        this.done = false
    }
    reset(t) {
        this.done = false
        this.limit = +(t) || this.limit
        this.time = 0
    }
    tick() {
        if (this.time < this.limit) {
            this.time++
            return this.done = false;

        }
        else if (this.time === this.limit){
            this.func?.()
            this.time++
            return this.done = true
        }
       
    }
}
class blade extends entity {
    constructor(x,y,size) {
        super(x,y,size)
        this.shape = 3;
        this.color = '#0700f7'
        this.velocity.a = 0.1
        let f = new entity(this.x,this.y,this.size,this.shape,3)
        f.color = this.color
        f.velocity.a = -0.1 
    }
    collide(coll) {
        if (coll === player) {
            coll.kill()
        }
    }
}
class swirl extends enemy {
    constructor(x,y,size,shape,speed){
        super(x,y,size,shape)
        this.speed = speed;
        this.velocity.a = 0.1
        this.color = '#0700f7'

    }
    newPos(){
        super.newPos()
        this.velocity.x = Math.cos(this.rot)*this.speed;
        this.velocity.y = Math.sin(this.rot)*this.speed
    }
}