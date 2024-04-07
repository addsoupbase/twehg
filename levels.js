let level = function* () {

    yield (() => {
        //level 1
        flags.started = true
        spawnPlayer(200, 250)
        player.teleport(1 / 0, 1 / 0)

        outer: for (let ii = 0; ii < 3; ii++) {
            for (let i = 0; i < 8; i++) {
                if (ii === 1 && i === 7) {
                    continue outer
                }
                let n = new wall(50 + (ii * 330), 50 + (i * (wallSize * 2)), wallSize, 4)
                

            }
        }
        for (let ii = 0; ii < 2; ii++) {
            for (let i = 0; i < 12; i++) {
                let n = new wall(50 + (i * (wallSize * 2)), ii === 1 ? 50 : 530, wallSize, 4)
                

            }
        }
        for (let i = 0; i < 4; i++) {
            let f = new enemy(i % 2 === 1 ? 145 : 290, 170 + (i * 100), 10)
            f.color = '#0700f7'
            f.velocity.x = i % 2 === 1 ? 7 : -7
        }
        let f = new enemy(450, 200, 10)
        f.color = '#0700f7'
        f.velocity.y = 10
        new checkPoint(600, 200, 50)
        player.teleport(230, 100)
        entity.startPos.x = player.x
        entity.startPos.y = player.y
    })()
    yield (() => {
        //level 2
        player.teleport(1 / 0, 1 / 0)
        new turret(95, 95, 18, '#ff00c3', 500)
        new turret(1260, 95, 18, '#ff00c3', 500)

        for (let i = 0; i < 22; i++) {
            if (i === 10 || i === 11) { continue }
            let n = new wall(50 + (i * (wallSize * 2)), 630, wallSize * 1.2, 4)
            

        }
        for (let i = 1; i < 21; i++) {
            let n = new wall(49 + (i * (wallSize * 2)), 50, wallSize, 4)
            

        }
        for (let ii = 0; ii < 2; ii++) {
            for (let i = 0; i < 9; i++) {

                let n = new wall(ii ? 44 : 1314.5, 50 + (i * (wallSize * 2)), wallSize, 4)
                

            }
        }
        new coin(45, 575)
        new coin(1313, 575)

        for (let i = 0; i < 8; i++) {
            let f = new enemy((50 * 2) + i * 60, 150 + (i * 30), 10)
            f.color = '#0700f7'
            f.velocity.y = 5
        }
        for (let i = 0; i < 8; i++) {
            let f = new enemy((50 * 2) + i * 60, 350 + (i * 30), 10)
            f.color = '#0700f7'
            f.velocity.y = 5
        }

        for (let i = 0; i < 8; i++) {
            let f = new enemy((400 * 2) + i * 60, 150 + (i * 30), 10)
            f.color = '#0700f7'
            f.velocity.y = 5
        }
        for (let i = 0; i < 8; i++) {
            let f = new enemy((400 * 2) + i * 60, 350 + (i * 30), 10)
            f.color = '#0700f7'
            f.velocity.y = 5
        }
        for (let i = 2; i < 10; i++) {
            let f = new enemy(150, 110 + (i * 50), 10)
            f.color = '#0700f7'
            f.velocity.x = 10
        }
        new checkPoint((cwidth / 2) - 3, 630, 50)
        player.teleport(675, 120)
        entity.startPos.x = player.x
        entity.startPos.y = player.y
    })()
    yield (() => {
        //level 3
        player.teleport(1 / 0, 1 / 0)
        for (let i = 0; i < 21; i++) {
            let n = new wall(50 + (i * (wallSize * 2)), 50, wallSize, 4)
            
        }
        for (let i = 0; i < 20; i++) {
            let n = new wall(110 + (i * (wallSize * 2)), 350, wallSize, 4)
            
        } for (let ii = 0; ii < 2; ii++) {
            for (let i = 0; i < 6; i++) {
                let n = new wall(ii === 0 ? 50 : 1250, 50 + (i * (wallSize * 2)), wallSize, 4)
                
            }
        }

        for (let i = 0; i < 7; i++) {
            let n = new wall(320 + (i * (wallSize * 4)), i % 2 === 1 ? 110 : 290, wallSize, 4)
            

            let f = new turret(260 + (i * (wallSize * 4)), i % 2 === 1 ? 110 : 290, 18, '#ff00c3', i === 0 ? 100 : 160)
            new coin(320 + (i * (wallSize * 4)), i % 2 === 1 ? 160 : 290 - 60)
        }
        new checkPoint(1155, 200, 50)
        player.teleport(100, 200)
        entity.startPos.x = player.x
        entity.startPos.y = player.y
    })()
    yield (() => {
        //level 4
        player.teleport(1 / 0, 1 / 0)
        let xx = cwidth / 2, yy = cheight / 2;

        let m = new checkPoint(cwidth / 2, cheight / 2, 50)
        m.shape = 0
        for (let i = 0; i < 50; i++) {
            let angle = (i / 50) * 2 * Math.PI; // Calculate angle for each enemy
            let f = new enemy(xx + (100 * Math.cos(angle)), yy + (100 * Math.sin(angle)), 8);
            f.color = '#008cff';
            f.edgeType = 'bounce';
            // Calculate velocities based on angle
            f.velocity.x = -Math.cos(angle) * 50 / 7;
            f.velocity.y = -Math.sin(angle) * 50 / 7;
        }
        for (let i = 0; i < 10; i++) {
            let angle = (i / 10) * 2 * Math.PI;
            let c = new coin(xx + (100 * Math.cos(angle)), yy + (100 * Math.sin(angle)))
        }
        player.teleport(100, 200)
        let x = new wall(player.x, player.y, wallSize, 4);
        x.color = '#7a7a7a'
        x.o = 5
        entity.startPos.x = player.x
        entity.startPos.y = player.y
    })()
    yield (() => {
        for (let ii = 0; ii < 8; ii++) {
            for (let i = 4; i < 13; i++) {
                let b = new block(40 + (80 * i), -100 - (ii * 100), 40)
            }
        }
        player.teleport(cwidth / 2, 500)
        entity.startPos.x = player.x
        entity.startPos.y = player.y
    })()
}()
