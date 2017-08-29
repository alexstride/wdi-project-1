const COLORS = ['#5679f7', '#f78a0e', '#d6d6d6', '#d60202', '#8f14d1', '#13c600', '#fcf63c'];
const WIDTH = 8;
const HEIGHT = WIDTH;

//________________GRID OBJECT_______________________________
const gridObject = {
  colorArray: COLORS,
  width: WIDTH,
  height: HEIGHT,
  valueArray: null, //2D array of number values, representing colors
  $elementArray: null, //1D array of .box elements on the page
  activeBox1: null,
  activeBox2: null,
  coord2Index: function(coordinate) {
    return (coordinate[1]*this.width) + (coordinate[0]);
  },

  getElementByCoordinate: function(coord) {
    return this.$elementArray[this.coord2Index(coord)];
  },

  setBoxPosition: function($box, coordinate) {
    //box: jquery element
    $box.css({
      'top': `${(coordinate[1] * 54) + 2}px`,
      'left': `${(coordinate[0]* 54) + 2}px`
    });
  },

  swapSquares: function(coordinate1, coordinate2) {
    console.log('Swapping squares');
    const $box1 = $(this.getElementByCoordinate(coordinate1));
    const $box2 = $(this.getElementByCoordinate(coordinate2));
    const dataId1 = $box1.attr('data-id');
    const dataId2 = $box2.attr('data-id');
    $box1.attr('data-id', dataId2);
    $box1.css('background-color', this.colorArray[dataId2]);
    $box2.attr('data-id', dataId1);
    $box2.css('background-color', this.colorArray[dataId1]);
    // this.setBoxPosition(box1, coordinate2);
    // this.setBoxPosition(box2, coordinate1);
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
    console.log('Initial valueArray: ', this.valueArray);
    let initialMatches = this.checkGrid();
    while (initialMatches.length > 0) {
      console.log('Detected following matches: ', initialMatches);
      this.valueArray = this.generateNewValueArray(initialMatches);
      console.log('New valueArray: ', this.valueArray);
      initialMatches = this.checkGrid();
    }
  },

  initializeElementArray: function() {
    this.$elementArray = $('div.box');
    //give each element an id number, from 0 to 63.
    for (let i = 0; i < this.$elementArray.length; i ++) {
      $(this.$elementArray[i]).attr('id', i).css({
        'top': `${(Math.floor(i/this.width) * 54) + 2}px`,
        'left': `${((i%this.width) * 54) + 2}px`
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
      $(this.$elementArray[i]).css('background-color', this.colorArray[flatGridArray[i]]).attr('data-id', flatGridArray[i]);
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

  generateNewValueArray: function(coordinateArray) {

    const columns = [];
    for (let i = 0; i < this.width; i++) {
      //console.log('Value of coordinateArray: ', coordinateArray);
      const positionsToRemove = coordinateArray.filter((coordinate) => coordinate[0] === i).map((coordinate) => coordinate[1]);
      // console.log('positions being removed from column: ');
      // console.log(positionsToRemove);
      const newValues = positionsToRemove.map(() => Math.floor(Math.random() * this.colorArray.length));
      columns.push(this.updateColumnForMatch(gridObject.getColumn(i), positionsToRemove, newValues));
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
  },

  generateWithFrontEnd: function(coordinateArray) {
    //Build a new grid object, updating the front end along the way.
    //coordinateArray: an array of the coordinates of cells which have been matched and need to be removed.

    //Go through the columns and add the newly generated squares to the top of each column.
    const columns = [];
    for (let i = 0; i < this.width; i++) {
      //console.log('Value of coordinateArray: ', coordinateArray);
      const positionsToRemove = coordinateArray.filter((coordinate) => coordinate[0] === i).map((coordinate) => coordinate[1]);
      // console.log('positions being removed from column: ');
      // console.log(positionsToRemove);
      const newBoxes =
      columns.push(this.updateColumnForMatch(gridObject.getColumn(i), positionsToRemove));
    }
  }

}; //______END GRID OBJECT_______________________________________

//________________MOVE OBJECT_______________________________
//Creating a Move object, which can be created for each move the user wants to make.
const moveObject = {
  activeBox1: null,
  activeBox2: null,
  areAdjacent: function() {
    return (Math.abs($(this.activeBox1).data('x') - $(this.activeBox2).data('x')) + Math.abs($(this.activeBox1).data('y') - $(this.activeBox2).data('y'))) === 1;
  },

  triggerMoveEvent: function() {
    //notify the grid object that there is now a change that needs to be handled and send through the coordinates of the squares which are being moved.
    $(document).trigger('userMove', [[$(this.activeBox1).data('x'), $(this.activeBox1).data('y')], [$(this.activeBox2).data('x'), $(this.activeBox2).data('y')]]);

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
    //Should not be called independently of changeDisplay
    console.log('Committing a match on the following coordinates: ', matchCoordinates);
    console.assert(this.pairSwappedArray);
    console.log('matchHandler.commitMatch needs testing!');

    //uses the updateGrid method of the gridObject to update the main grid.
    //FLAWED because squares not swapped: gridObject.valueArray = gridObject.generateNewValueArray(matchCoordinates);

    //swap around the squares on the board
    gridObject.swapSquares(this.pos1, this.pos2);

    //Add the new squares to the top of the relevant rows, with suitable positions.

    //Burn the matched squares on the board.

    //Update the positions of all of the squares in the changed columns, so that they fall and settle in the right places.
    //
  },

  changeDisplay: function(pos1, pos2, matchCoordinates, $arrayOfBoxes) {
    //Should not be called independently of commitMatch!
    console.log('matchHandler.changeDisplay not yet implemented');

  },

  processMove: function(event, pos1, pos2) {
    //Note that 'this' will be the moveEvent for this function.
    matchHandler.pos1 = pos1;
    matchHandler.pos2 = pos2;
    const moveOutcome = matchHandler.checkMove(pos1, pos2);
    if (moveOutcome) {
      //send instructions to the screen to update display.
      matchHandler.changeDisplay(moveOutcome);
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

$(function() {
  gridObject.initializeValueArray();
  gridObject.initializeElementArray();
  gridObject.initializeColors();
  gridObject.$elementArray.on('click', processClick);

  $(document).on('userMove', matchHandler.processMove);
  // $(document).on('matchMade', (e, coordinates) => {
  //   console.log('Match detected', coordinates);
  // });

  ////Some code to visualise the creation of a new gridObject
  // const matches = gridObject.checkGrid();
  // console.log('Matches found in initial array: ');
  // console.log(matches);
  //
  // console.log('Old grid: ');
  // console.log(gridObject.valueArray);
  // console.log('New grid: ');
  // console.log(gridObject.generateNewValueArray(matches));
});
