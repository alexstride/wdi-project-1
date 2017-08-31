const COLORS = ['#5679f7', '#d6d6d6', '#d60202', '#8f14d1', '#13c600', '#fcf63c'];//, '#f78a0e'
const colorNames = ['blue', 'orange', 'grey', 'red', 'pruple', 'green', 'yellow'];
const WIDTH = 8;
const HEIGHT = WIDTH;

const gameObject = {
  gameActive: false,
  score: 0,
  timer: 100
};

function fadeColor(fromR, fromG, fromB, targetR, targetG, targetB, increments, stage) {
  const r = fromR + (targetR-fromR)/increments*stage;
  const g = fromG + (targetG-fromG)/increments*stage;
  const b = fromB + (targetB-fromB)/increments*stage;
  return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
}

function fadeGreenOrange(increments, stage) {
  return fadeColor(247, 138, 14, 19, 198, 0, increments, stage);
}

function fadeOrangeRed(increments, stage) {
  return fadeColor(214, 2, 2, 247, 138, 14, increments, stage);
}


$(function() {
  const $score = $('.score-value');
  const $startScreen = $('.start-screen');
  const $startButton = $('.start-button');
  const $timerBar = $('.timer-bar');
  const $finalScore = $('.final-score');
  const $scoreDiv = $('.score');
  const $firstBox = $('.box').eq(0);
  const $gameWrapper = $('.game-wrapper');
  const boxBorder = parseInt($firstBox.css('border-left-width'));
  const boxGap = parseInt($firstBox.css('margin'));
  const boxWidth = ($gameWrapper.width()/8) - (2 * (boxBorder + boxGap));
  const boxFootPrint = boxWidth + (2 * boxBorder) + (2 * boxGap);
  const audio = $('audio')[0];

  //________________GRID OBJECT_______________________________
  const gridObject = {
    colorArray: COLORS,
    width: WIDTH,
    height: HEIGHT,
    valueArray: null, //2D array of number values, representing colors
    $elementArray: null, //1D array of .box elements on the page
    $gridWrapper: null,
    activeBox1: null,
    activeBox2: null,

    getElementByCoordinate: function(coord) {
      console.log('getElementByCoordinate: ', coord);
      const result = $(`.box[data-x=${coord[0]}][data-y=${coord[1]}]`)[0];
      if (result) {
        return result;
      } else {
        throw `Unsuccessful query error for .box[data-x=${coord[0]}][data-y=${coord[1]}]`;
      }
    },

    setBoxPosition: function($box, coordinate) {
      //box: jquery element
      $box.css({
        'top': `${(coordinate[1] * boxFootPrint)}px`,
        'left': `${(coordinate[0]* boxFootPrint)}px`
      });
    },

    setYPosition: function($box, yPos) {
      //box: jquery element
      $box.css({
        'top': `${(yPos * boxFootPrint)}px`
      });
    },

    swapSquares: function(coordinate1, coordinate2) {
      //makes the change in the DOM and on the back end.
      const value1 = gridObject.valueArray[coordinate1[1]][coordinate1[0]];
      const value2 = gridObject.valueArray[coordinate2[1]][coordinate2[0]];
      gridObject.valueArray[coordinate1[1]][coordinate1[0]] = value2;
      gridObject.valueArray[coordinate2[1]][coordinate2[0]] = value1;
      const $box1 = $(this.getElementByCoordinate(coordinate1));
      const $box2 = $(this.getElementByCoordinate(coordinate2));
      const dataId1 = $box1.attr('data-id');
      const dataId2 = $box2.attr('data-id');
      $box1.attr('data-id', dataId2);
      $box1.css('background-color', this.colorArray[dataId2]);
      $box2.attr('data-id', dataId1);
      $box2.css('background-color', this.colorArray[dataId1]);
    },

    initializeValueArray: function () {
      //A function to create a new grid object (array of arrays) using the dimensions defined in args.
      const resultArray = [];
      for (let i = 0; i < this.height; i++) {
        const row = [];
        for (let j = 0; j < this.width; j++) {
          row.push(Math.floor(Math.random()*this.colorArray.length));
        }
        resultArray.push(row);
      }
      this.valueArray = resultArray;
      let initialMatches = this.checkGrid();
      while (initialMatches.length > 0) {
        this.valueArray = this.generateWithFrontEnd(initialMatches, false);
        initialMatches = this.checkGrid();
      }
    },

    initializeElementArray: function() {
      this.$elementArray = $('div.box');
      this.$gridWrapper = $('.game-wrapper');
      //give each element an id number, from 0 to 63.
      for (let i = 0; i < this.$elementArray.length; i ++) {
        $(this.$elementArray[i]).css({
          'top': `${(Math.floor(i/this.width) * boxFootPrint)}px`,
          'left': `${((i%this.width) * boxFootPrint)}px`
        });
      }
      //assign each element a top and left position to put it in the right place in the grid.
    },

    initializeColors: function() {
      //A function to initally fill all of the boxes with random colors
      //flatenning out grid object
      const flatGridArray = gridObject.returnFlat();
      //looping over the dom elements for the boxes applyng the colors
      for (let i = 0; i < this.$elementArray.length; i++) {
        $(this.$elementArray[i])
          .css('background-color', this.colorArray[flatGridArray[i]])
          .attr('data-id', flatGridArray[i]);
      }
    },

    returnFlat: function() {
      //Returns a flattened copy of the entire grid object.
      return this.valueArray.reduce((flatArray, array) => flatArray.concat(array), []);
    },

    getColumn: function(x, grid=this.valueArray) {
      //takes in a value for x and returns and array representing one column of the grid array
      return grid.map(row => row[x]);
    },

    getRow: function(y, grid=this.valueArray) {
      //takes in a value for y and returns and array representing one row of the grid array
      return grid[y];
    },

    checkRow: function(row) {
      //will return the indices of the elements which are part of a valid match
      const result = [];
      let currLength = 1;
      let lastSeen = null;
      let currValue = null;
      for (const index in row) {
        currValue = row[index];
        if (currValue !== lastSeen) {
          //if there is a current match stored, push it into the result array.
          if (currLength > 2) {
            for (let i = currLength; i > 0; i--) {
              result.push(index - i);
            }
          }
          lastSeen = currValue;
          currLength =  1;
        } else { //i.e. in the case where the current value is the same as the last seen value
          currLength +=1;
        }
      }
      //This handles the situation where a match ends at the end of a row.
      if (currLength > 2) {
        for (let i = currLength; i > 0; i--) {
          result.push(this.width - i);
        }
      }
      return result;
    },

    checkGrid(grid=this.valueArray) {
      //returns an array of coordinates for the cells which are part of a match.
      let result = [];
      //this loops over the rows, but will also check the columns at the same time!
      for (let rowColNumber = 0; rowColNumber < this.width; rowColNumber++) {
        result = result.concat(this.checkRow(this.getRow(rowColNumber, grid)).map((x) => [x, rowColNumber]));
        result = result.concat(this.checkRow(this.getColumn(rowColNumber, grid)).map((y) => [rowColNumber, y]));
      }
      return result;
    },

    updateColumnForMatch: function(column, positionArray, newValues) {
      //column: the values from the old column
      //positionArray: An array of the positions within the column to be removed.
      //newValues: An array of randomly generated new values to begin the column with. ORDER IMPORTANT
      const newColumn = newValues.slice();
      column.filter((element, index) => positionArray.indexOf(index) === -1).forEach((element) => {
        newColumn.push(element);
      });
      return newColumn;
    },

    createNewBox: function(colorValue, x, y) {
      console.log(`Creating new box at [${x},${y}], color: ${colorNames[colorValue]}`);
      const newBox = $('<div>', {
        'data-id': colorValue,
        'data-x': x,
        'data-y': y
      })[0];
      $(newBox).addClass('box').css({
        'background-color': this.colorArray[colorValue],
        'transition': 'top 0.5s'
      });
      this.setBoxPosition($(newBox), [x, y]);
      return newBox;
    },

    tellBoxesToMove: function(blankCoordinates) {
      //Telling boxes to move down.
      for (let i = 0; i < 8; i ++) {
        //get all boxes in a certain column
        const $boxesInColumn = $(`[data-x="${i}"]`);

        //find all of the positions in that column which have been deleted:
        const blankPositionsInColumn = blankCoordinates
          .filter(coordinate => coordinate[0] === i)
          .map((coordinate) => coordinate[1]);

        //Looping through the boxes in the column and finding the y position
        $boxesInColumn.each((index, element) => {
          const yPosition = parseInt($(element).attr('data-y'));
          //find the count of the numbers in blank positions which are greater than the box's y position
          const valueToMoveBy = blankPositionsInColumn.filter(num => num > yPosition).length;
          $(element).attr('data-y', yPosition + valueToMoveBy);
          gridObject.setYPosition($(element), yPosition + valueToMoveBy);
        });

      }
    },

    //###############################################################################################################
    generateWithFrontEnd: function(coordinateArray, screenUpdate=true) {
      //Build a new grid object, updating the front end along the way.
      //coordinateArray: an array of the coordinates of cells which have been matched and need to be removed.

      //Go through the columns and add the newly generated squares to the top of each column.
      const columns = [];
      //looping over the columns. Calls:
      for (let i = 0; i < this.width; i++) {
        //creates an array of positions to remove from the column.
        const positionsToRemove = coordinateArray.filter((coordinate) => coordinate[0] === i).map((coordinate) => coordinate[1]);

        //Creating an array of random new values, to be fed in from the top of the grid
        const newValues = positionsToRemove.map(() => Math.floor(Math.random() * this.colorArray.length));

        if (screenUpdate) {
          //Looping over new values, creating boxes and appending them to parent div. Calls: createNewBox.
          for (let l = 0; l < newValues.length; l++) {
            const newBox = this.createNewBox(newValues[l], i, l - newValues.length);
            this.$gridWrapper.append(newBox);
          }
        }

        //pushing in the end-state for the matrix calculated independently of the screen state
        columns.push(this.updateColumnForMatch(gridObject.getColumn(i), positionsToRemove, newValues));
      } //End looping over columns

      //Removing the boxes of the elements which need to disappear. Calls;
      //finding all of the boxes which need to move, changing their y value and telling them to move.

      if (screenUpdate) {
        //Removing the boxes of the match
        const boxesToRemove = coordinateArray.map(coordinate => {
          return gridObject.getElementByCoordinate(coordinate);
        });
        console.log('removing boxes', coordinateArray);
        boxesToRemove.forEach((box) => $(box).remove());
        //increasing the score by the number of boxes which have been matched
        gameObject.score += coordinateArray.length;
        audio.play();

        if (gameObject.timer < 100 - ((coordinateArray.length) * 4)) {
          gameObject.timer += (coordinateArray.length) * 4;
        } else {
          gameObject.timer = 100;
        }

        $('.score-value').text(gameObject.score);

        //Waiting before making boxes fall (to allow animation to take effect)
        setTimeout(() => {
          this.tellBoxesToMove(coordinateArray);
        }, 150);

      }

      //Now need to transpose the array, because it should be an array of rows.
      const result = [];
      for(let j = 0; j < this.height; j++) {
        const newRow = [];
        for(let k = 0; k < this.width; k ++) {
          newRow.push(columns[k][j]);
        }
        result.push(newRow);
      }
      return result;
    }

  }; //______END GRID OBJECT_______________________________________

  //________________MOVE OBJECT_______________________________
  //Creating a Move object, which can be created for each move the user wants to make.
  const moveObject = {
    activeBox1: null,
    activeBox2: null,
    areAdjacent: function() {
      return (Math.abs(parseInt($(this.activeBox1).attr('data-x')) - parseInt($(this.activeBox2).attr('data-x'))) + Math.abs(parseInt($(this.activeBox1).attr('data-y')) - parseInt($(this.activeBox2).attr('data-y')))) === 1;
    },

    triggerMoveEvent: function() {
      //notify the grid object that there is now a change that needs to be handled and send through the coordinates of the squares which are being moved.
      $(document).trigger('userMove', [[parseInt($(this.activeBox1).attr('data-x')), parseInt($(this.activeBox1).attr('data-y'))], [parseInt($(this.activeBox2).attr('data-x')), parseInt($(this.activeBox2).attr('data-y'))]]);

    },
    deactivateBoxes: function() {
      //Using a setTimeout of 0 to ensure that this stage cannot be queued to happen before the information about the clicked squares has been read from the DOM.
      window.setTimeout(() => {
        $(this.activeBox1).removeClass('selected');
        this.activeBox1 = null;
        $(this.activeBox2).removeClass('selected');
        this.activeBox2 = null;
      }, 0);
    }
  }; //______END MOVE OBJECT_______________________________________

  //________________MATCH HANDLER_______________________________
  const matchHandler = {
    pairSwappedArray: null,
    pos1: null,
    pos2: null,
    checkMove: function() {
      console.log(`Checking move to swap [${this.pos1[0]},${this.pos1[1]}] and [${this.pos2[0]},${this.pos2[1]}]`);
      this.pairSwappedArray = clone2D(gridObject.valueArray);
      const buffer = this.pairSwappedArray[this.pos1[1]][this.pos1[0]];
      this.pairSwappedArray[this.pos1[1]][this.pos1[0]] = this.pairSwappedArray[this.pos2[1]][this.pos2[0]];
      this.pairSwappedArray[this.pos2[1]][this.pos2[0]] = buffer;
      const newMatch = gridObject.checkGrid(this.pairSwappedArray);
      if (newMatch.length > 0) {
        return newMatch;
      } else {
        return null;
      }
    },

    commitMatch: function(matchCoordinates) {
      console.assert(this.pairSwappedArray);

      //uses the updateGrid method of the gridObject to update the main grid.

      //swap around the squares on the board
      gridObject.swapSquares(this.pos1, this.pos2);

      //Add the new squares to the top of the relevant rows, with suitable positions.
      let remainingMatches = matchCoordinates;
      gridObject.valueArray = gridObject.generateWithFrontEnd(remainingMatches);
      const interval = setInterval(() => {
        console.log('Interval!');
        remainingMatches = gridObject.checkGrid(gridObject.valueArray);
        if (remainingMatches.length === 0) {
          clearInterval(interval);
        } else {
          gridObject.valueArray = gridObject.generateWithFrontEnd(remainingMatches);
        }
      }, 750);

    },

    processMove: function(event, pos1, pos2) {
      //Note that 'this' will be the moveEvent for this function.
      matchHandler.pos1 = pos1;
      matchHandler.pos2 = pos2;
      const moveOutcome = matchHandler.checkMove(pos1, pos2);
      if (moveOutcome) {
        //send instructions to the screen to update display.
        //commit the move to the back-end object.
        matchHandler.commitMatch(moveOutcome);
      }
    }
  }; //____________END MATCH HANDLER_______________________________

  //This function needs to sit in the global scope as it inherits its context from the click event.
  const processClick = function(clickEvent) {
    if (!moveObject.activeBox1) {
      moveObject.activeBox1 = clickEvent.target;
      $(clickEvent.target).addClass('selected');
    } else {
      moveObject.activeBox2 = clickEvent.target;
      $(clickEvent.target).addClass('selected');
      if (moveObject.areAdjacent()) {
        moveObject.triggerMoveEvent();
      }
      window.setTimeout(() => {
        moveObject.deactivateBoxes();
      }, 250);
    }
  };

  function clone2D(oldArray) {
    return oldArray.map(element => element.slice());
  }

  function gameOver() {
    //Show a gameOver screen, which displays the user's score and asks if they want to play again.
    $startScreen.css('visibility', 'visible');
    $startButton.html('<p>Play Again</p>');
    $finalScore.css('display', 'initial');
    $finalScore.text(`Your score: ${gameObject.score}`);
    $scoreDiv.css('visibility', 'hidden');
  }

  gridObject.initializeValueArray();
  gridObject.initializeElementArray();
  gridObject.initializeColors();
  gridObject.$gridWrapper.on('click', '.box', processClick);
  $score.text(gameObject.score);

  //Game start function
  $startButton.on('click', () => {
    gameObject.timer = 100;
    gameObject.score = 0;
    $startScreen.css('visibility', 'hidden');
    $timerBar.removeClass('flashing-fast');
    $timerBar.css('visibility', 'visible');
    $scoreDiv.css('visibility', 'visible');
    $score.text(gameObject.score);
    const interval = setInterval(() => {
      gameObject.timer -= 1;
      if (gameObject.timer === 0) {
        gameOver();
        clearInterval(interval);
      } else if (gameObject.timer === 20) {
        $timerBar.addClass('flashing-fast');
      }
      $timerBar.css({
        'width': `${gameObject.timer}%`,
        'background-color': (gameObject.timer > 50 ? fadeGreenOrange(50, gameObject.timer-50) : fadeOrangeRed(50, gameObject.timer))
      });
    }, 150);
  });

  $(document).on('userMove', matchHandler.processMove);
});
