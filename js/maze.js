'use strict';

const TOP     = 1;
const BOTTOM  = 2;
const RIGHT   = 4;
const LEFT    = 8;
const VISITED = 16;

/**
 * A maze is a two dimensional array of cells.
 * Each cell describes which passage is possible.
 *
 * Initially all cells are solid. You have to carve passages to get
 * a maze.
 */
class Maze {

    /**
     * Creates a instance of class Maze.
     * @param rows    Number of rows, must be > 0
     * @param columns Number of columns, must be > 0
     */
    constructor(rows, columns) {
        if (rows <= 0) {
            throw 'parameter for rows is not > 0: ' + rows
        }
        if (columns <= 0) {
            throw 'parameter for columns is not > 0: ' + columns
        }
        this.passages = Array(rows); // contains all cells and their passages
        // initialize maze with walls at every cell
        for (let i = 0; i < rows; i++) {
            this.passages[i] = Array(columns).fill(0);
        }
        this.r = 0;      // current row of person in maze
        this.c = 0;      // current column of person in maze
        this.carved = 0; // current number of carved cells
    }

    get rows() {
        return this.passages.length;
    }

    get columns() {
        return this.passages[0].length;
    }

    /**
     * Set person position.
     * @param i   Person row position, starting with 0.
     * @param j   Person column position, starting with 0.
     */
    goto(i, j) {
        if (!this.isValid(i, j)) return;
        this.r = i;
        this.c = j;
    }

    /**
     * Are the given  maze coordinates valid?
     * @param i   Row number, starting with 0.
     * @param j   Column number, starting with 0.
     * @returns {boolean} true if valid coordinates, else false
     */
    isValid(i, j) {
        return i >= 0 && i < this.rows && j >= 0 && j < this.columns;
    }

    /**
     * Carve a passage in the given direction at the given coordinates.
     * @param i   Row number, starting with 0.
     * @param j   Column number, starting with 0.
     * @param direction   Direction value, should be one of TOP, BOTTOM, LEFT, RIGHT
     * @returns {boolean} Were the coordinates valid?
     */
    carve(i, j, direction) {
        if (!this.isValid(i, j)) return false;
        if (this.isSolid(i, j)) this.carved++;
        this.passages[i][j] |= direction;
        return true;
    }

    /**
     * Has the maze a passage at given coordinates in the given direction?
     * @param i   Row number, starting with 0.
     * @param j   Column number, starting with 0.
     * @param direction   Check if the cell has a passage in this direction.
     *                    Valid direction values are TOP, BOTTOM, LEFT and RIGHT.
     * @returns {boolean}   true, if cell exists and has a passage in the given direction.
     */
    hasPassage(i, j, direction) {
        return this.isValid(i, j) && ((direction & this.passages[i][j]) !== 0);
    }

    /**
     * Is the maze still solid (has no passages) at the given coordinates?
     * @param i   Row number, starting with 0.
     * @param j   Column number, starting with 0.
     * @returns {boolean}   true, if cell is still uncarved.
     */
    isSolid(i, j) {
        return this.isValid(i, j) && (this.passages[i][j] & (TOP | BOTTOM | LEFT | RIGHT)) === 0;
    }

    /**
     * Get number of solid (that means uncarved) cells.
     * @returns {number}
     */
    get solids() {
        return this.rows * this.columns - this.carved;
    }

    /**
     * Mark a cell as visited.
     * @param i    Row of cell, starting with 0.
     * @param j    Column of cell, starting with 0.
     * @returns {boolean}   Was cell valid?
     */
    visit(i, j) {
        if (!this.isValid(i, j)) return false;
        this.passages[i][j] |= VISITED;
        return true;
    }

    /**
     * Was cell with given coordinates visited?
     * @param i   Row of cell, starting with 0.
     * @param j   Column of cell, starting with 0.
     * @returns {boolean}    Was cell coordinates valid and cell visited?
     */
    isVisited(i, j) {
        return this.isValid(i, j) && ((this.passages[i][j] & VISITED) !== 0);
    }

    toString() {
        let lines = '';
        // print top walls of top row
        for (let j = 0; j < this.columns; j++) {
            lines += (this.hasPassage(0, j, TOP) ? '   ' : ' __');
        }
        lines += "\n";

        // iterate over each row
        for (let i = 0; i < this.rows; i++) {
            // print left and bottom wall for each cell of current row
            for (let j = 0; j < this.columns; j++) {
                lines += (this.hasPassage(i, j, LEFT) ? ' ' : '|');
                if (this.r === i && this.c === j) {
                    lines += (this.hasPassage(i, j, BOTTOM) ? 'X ' : 'X_');
                } else if (this.isVisited(i, j)) {
                    lines += (this.hasPassage(i, j, BOTTOM) ? '* ' : '*_');
                } else {
                    lines += (this.hasPassage(i, j, BOTTOM) ? '  ' : '__');
                }
            }
            // print right wall for last cell of row
            lines += (this.hasPassage(i, this.columns - 1, RIGHT) ? ' ' : '|');
            lines += "\n";
        }
        return lines;
    }
}

/**
 * Carve on a maze. Carving starts at a given position.
 */
class Carver {

    /**
     * Creates a instance of class Carver.
     * @param maze   This maze we will carve on.
     */
    constructor(maze) {
        this.m = maze;    // maze we are carving on
        this.r = 0;       // current carving position row
        this.c = 0;       // current carving column
    }

    /**
     * Set carving position.
     * @param i   Carving row position, starting with 0.
     * @param j   Carving column position, starting with 0.
     */
    goto(i, j) {
        if (!this.m.isValid(i, j)) return;
        this.r = i;
        this.c = j;
    }

    carveBottom() {
        if (!this.m.isValid(this.r, this.c)) return;
        if (!this.m.isValid(this.r + 1, this.c)) return;
        this.m.carve(this.r, this.c, BOTTOM);
        this.m.carve(this.r + 1, this.c, TOP);
        this.r += 1;
    }

    goBottomCarveIfSolid() {
        if (!this.m.isValid(this.r, this.c)) return;
        if (!this.m.isValid(this.r + 1, this.c)) return;
        if (this.m.isSolid(this.r + 1, this.c)) {
            this.m.carve(this.r, this.c, BOTTOM);
            this.m.carve(this.r + 1, this.c, TOP);
        }
        this.r += 1;
    }

    carveTop() {
        if (!this.m.isValid(this.r, this.c)) return;
        if (!this.m.isValid(this.r - 1, this.c)) return;
        this.m.carve(this.r, this.c, TOP);
        this.m.carve(this.r - 1, this.c, BOTTOM);
        this.r -= 1;
    }

    goTopCarveIfSolid() {
        if (!this.m.isValid(this.r, this.c)) return;
        if (!this.m.isValid(this.r - 1, this.c)) return;
        if (this.m.isSolid(this.r - 1, this.c)) {
            this.m.carve(this.r, this.c, TOP);
            this.m.carve(this.r - 1, this.c, BOTTOM);
        }
        this.r -= 1;
    }

    carveRight() {
        if (!this.m.isValid(this.r, this.c)) return;
        if (!this.m.isValid(this.r, this.c + 1)) return;
        this.m.carve(this.r, this.c, RIGHT);
        this.m.carve(this.r, this.c + 1, LEFT);
        this.c += 1;
    }

    goRightCarveIfSolid() {
        if (!this.m.isValid(this.r, this.c)) return;
        if (!this.m.isValid(this.r, this.c + 1)) return;
        if (this.m.isSolid(this.r, this.c + 1)) {
            this.m.carve(this.r, this.c, RIGHT);
            this.m.carve(this.r, this.c + 1, LEFT);
        }
        this.c += 1;
    }

    goLeftCarveIfSolid() {
        if (!this.m.isValid(this.r, this.c)) return;
        if (!this.m.isValid(this.r, this.c - 1)) return;
        if (this.m.isSolid(this.r, this.c - 1)) {
            this.m.carve(this.r, this.c, LEFT);
            this.m.carve(this.r, this.c - 1, RIGHT);
        }
        this.c -= 1;
    }

    carveLeft() {
        if (!this.m.isValid(this.r, this.c)) return;
        if (!this.m.isValid(this.r, this.c - 1)) return;
        this.m.carve(this.r, this.c, LEFT);
        this.m.carve(this.r, this.c - 1, RIGHT);
        this.c -= 1;
    }
}

/**
 * Move on a maze. Changes position of man in maze.
 */
class Mover {

    /**
     * Creates a instance of class Mover.
     * @param maze   This maze we will move in.
     */
    constructor(maze) {
        this.m = maze;    // maze we are carving on
    }

    goBottom() {
        if (!this.m.isValid(this.m.r + 1, this.m.c)) return false;
        if (!this.m.hasPassage(this.m.r, this.m.c, BOTTOM)) return false;
        this.m.goto(this.m.r + 1, this.m.c);
        return true;
    }

    goTop() {
        if (!this.m.isValid(this.m.r - 1, this.m.c)) return false;
        if (!this.m.hasPassage(this.m.r, this.m.c, TOP)) return false;
        this.m.goto(this.m.r - 1, this.m.c);
        return true;
    }

    goRight() {
        if (!this.m.isValid(this.m.r, this.m.c + 1)) return false;
        if (!this.m.hasPassage(this.m.r, this.m.c, RIGHT)) return false;
        this.m.goto(this.m.r , this.m.c + 1);
        return true;
    }

    goLeft() {
        if (!this.m.isValid(this.m.r, this.m.c - 1)) return false;
        if (!this.m.hasPassage(this.m.r, this.m.c, LEFT)) return false;
        this.m.goto(this.m.r , this.m.c - 1);
        return true;
    }
}

class Solver {

    /**
     * Creates a instance of class Maze.
     * @param maze   This maze we will operate on.
     */
    constructor(maze) {
        this.m = maze;    // maze we are operating on
    }

    floodFill(i = 0, j = 0) {
        let stack = [[i, j]]; // remember front line
        while (stack.length > 0) {
            let [i, j] = stack.pop();
            if (this.m.isValid(i, j) && !this.m.isVisited(i, j)) {
                this.m.visit(i, j);
                if (this.m.hasPassage(i, j, BOTTOM)) stack.push([i + 1, j]);
                if (this.m.hasPassage(i, j, TOP)) stack.push([i - 1, j]);
                if (this.m.hasPassage(i, j, RIGHT)) stack.push([i, j + 1]);
                if (this.m.hasPassage(i, j, LEFT)) stack.push([i, j - 1]);
            }
        }
    }

    distance(i, j, k, l) {
        if (this.rows === 0 || this.columns === 0) return NaN;
        let p = Array(this.m.rows);
        for (let i = 0; i < this.m.rows; i++) {
            p[i] = Array(this.m.columns).fill(0);
        }
        let stack = [[i, j, 0]]; // remember front line
        while (stack.length > 0) {
            let [i, j, d] = stack.pop();
            if (this.m.isValid(i, j) && p[i][j] === 0) {
                p[i][j] = d + 1;
                if (i === k && j === l) {
                    this.m.visit(i, j);
                    // mark visits from the end
                    let e = d;
                    while (e > 0) {
                        if (this.m.isValid(i + 1, j) && p[i + 1][j] === e) {
                            i++;
                        } else if (this.m.isValid(i - 1, j) && p[i - 1][j] === e) {
                            i--;
                        } else if (this.m.isValid(i, j + 1) && p[i][j + 1] === e) {
                            j++;
                        } else if (this.m.isValid(i, j - 1) && p[i][j - 1] === e) {
                            j--;
                        } else {
                            throw new Error('should not occur')
                        }
                        this.m.visit(i, j);
                        e--;
                    }
                    return d;
                }
                if (this.m.hasPassage(i, j, BOTTOM)) stack.push([i + 1, j, d + 1]);
                if (this.m.hasPassage(i, j, TOP)) stack.push([i - 1, j, d + 1]);
                if (this.m.hasPassage(i, j, RIGHT)) stack.push([i, j + 1, d + 1]);
                if (this.m.hasPassage(i, j, LEFT)) stack.push([i, j - 1, d + 1]);
            }
        }
        return NaN;
    }
}


// print maze described by passages on console
function printMaze(m) {
    console.log(m.toString());
}

// create maze by randomly carving passages for each cell
function createBinaryTreeMaze(rows, columns) {
    let m = new Maze(rows, columns);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if (Math.random() < 0.5) {
                if (i + 1 < m.rows) {
                    m.carve(i, j, BOTTOM);
                    m.carve(i + 1, j, TOP)
                }
            } else if (j + 1 < m.columns) {
                m.carve(i, j, RIGHT)
                m.carve(i, j + 1, LEFT)
            }
        }
    }
    return m;
}

function createAldousBroderMaze(rows, columns) {
    let counter = 0;
    let m = new Maze(rows, columns);
    let c = new Carver(m);
    let row = Math.floor(Math.random() * m.rows);
    let column = Math.floor(Math.random() * m.columns);
    c.goto(row, column);
    while (m.solids > 0) {
        let choice = Math.floor(Math.random() * 4);
        switch (choice) {
            case 0:
                c.goBottomCarveIfSolid();
                break;
            case 1:
                c.goTopCarveIfSolid();
                break;
            case 2:
                c.goRightCarveIfSolid();
                break;
            case 3:
                c.goLeftCarveIfSolid();
                break;
        }
        counter++;
    }
    console.log('we made this number of random steps: ' + counter);
    return m;
}

function createRecursiveBacktrackerMaze(rows, columns) {
    let m = new Maze(rows, columns);
    let c = new Carver(m);
    let row = Math.floor(Math.random() * m.rows);
    let column = Math.floor(Math.random() * m.columns);
    c.goto(row, column);
    let stack = [[row, column]]; // remember front line
    while (stack.length > 0) {
        let [i, j] = stack.pop();
        c.goto(i, j);
        do {
            let i = c.r;
            let j = c.c;
            let choices = [];
            if (m.isSolid(i + 1, j)) choices.push(0);
            if (m.isSolid(i - 1, j)) choices.push(1);
            if (m.isSolid(i, j + 1)) choices.push(2);
            if (m.isSolid(i, j - 1)) choices.push(3);
            if (choices.length === 0) {
                break;
            }
            let choice = Math.floor(Math.random() * choices.length);
            switch (choices[choice]) {
                case 0:
                    c.carveBottom();
                    break;
                case 1:
                    c.carveTop();
                    break;
                case 2:
                    c.carveRight();
                    break;
                case 3:
                    c.carveLeft();
                    break;
            }
            stack.push([c.r, c.c])
        } while (true);
    }
    return m;
}

let m = new Maze(10, 10);
printMaze(m);

m = createBinaryTreeMaze(10, 10);
printMaze(m);

let solve = new Solver(m);
solve.distance(0, 0, 9, 9);
solve.floodFill();

printMaze(m);

m = createAldousBroderMaze(10, 40);
printMaze(m);

m = createRecursiveBacktrackerMaze(20, 40);
printMaze(m);

// let solve = new Solver(m);
// solve.distance(0, 0, 9, 9);
printMaze(m);
