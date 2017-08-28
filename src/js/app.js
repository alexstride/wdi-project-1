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
  },

  initializeElementArray: function() {
    this.$elementArray = $('div.box');
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

  getColumn: function(x) {
    //takes in a value for x and returns and array representing one column of the grid array
    return this.valueArray.map(row => row[x]);
  },

  getRow: function(y) {
    //takes in a value for y and returns and array representing one row of the grid array
    return this.valueArray[y];
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

  checkGrid() {
    //returns an array of coordinates for the cells which are part of a match.
    let result = [];
    //this loops over the rows, but will also check the columns at the same time!
    for (let rowColNumber = 0; rowColNumber < this.width; rowColNumber++) {
      result = result.concat(this.checkRow(this.getRow(rowColNumber)).map((x) => [x, rowColNumber]));
      result = result.concat(this.checkRow(this.getColumn(rowColNumber)).map((y) => [rowColNumber, y]));
    }
    return result;
  },

  updateColumnForMatch: function(column, positionArray) {
    const newColumn = [];
    positionArray.forEach(() => {
      newColumn.push(Math.floor(Math.random()*this.colorArray.length));
    });
    column.filter((element, index) => positionArray.indexOf(index) === -1).forEach((element) => {
      newColumn.push(element);
    });
    return newColumn;
  },

  generateNewValueArray: function(coordinateArray) {
    //Build a new grid object, column by column
    const columns = [];
    for (let i = 0; i < this.width; i++) {
      //console.log('Value of coordinateArray: ', coordinateArray);
      const positionsToRemove = coordinateArray.filter((coordinate) => coordinate[0] === i).map((coordinate) => coordinate[1]);
      console.log('positions being removed from column: ');
      console.log(positionsToRemove);
      columns.push(this.updateColumnForMatch(gridObject.getColumn(i), positionsToRemove));
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
    return (Math.abs($(this.activeBox1).data('x') - $(this.activeBox2).data('x')) + Math.abs($(this.activeBox1).data('y') - $(this.activeBox2).data('y'))) === 1;
  },

  triggerMoveEvent: function() {
    //notify the grid object that there is now a change that needs to be handled and send through the coordinates of the squares which are being moved.
    $(document).trigger('userMove', [{x: $(this.activeBox1).data('x'), y: $(this.activeBox1).data('y')}, {x: $(this.activeBox2).data('x'), y: $(this.activeBox2).data('y')}]);

  },
  deactivateBoxes: function() {
    //Using a setTimeout of 0 to ensure that this stage cannot be queued to happen before the information about the clicked squares has been read from the DOM.
    window.setTimeout(() => {
      $(this.activeBox1).text('');
      this.activeBox1 = null;
      $(this.activeBox2).text('');
      this.activeBox2 = null;
    }, 0);
  }
}; //______END MOVE OBJECT_______________________________________

//This function needs to sit in the global scope as it inherits its context from the click event.
const processClick = function(clickEvent) {
  if (!moveObject.activeBox1) {
    moveObject.activeBox1 = clickEvent.target;
    $(clickEvent.target).text('CSS');
  } else {
    moveObject.activeBox2 = clickEvent.target;
    if (moveObject.areAdjacent()) {
      moveObject.triggerMoveEvent();
    }
    moveObject.deactivateBoxes();
  }

};

$(function() {
  gridObject.initializeValueArray();
  gridObject.initializeElementArray();
  gridObject.initializeColors();
  gridObject.$elementArray.on('click', processClick);

  const matches = gridObject.checkGrid();
  console.log('Matches found in initial array: ');
  console.log(matches);

  console.log('Old grid: ');
  console.log(gridObject.valueArray);
  console.log('New grid: ');
  console.log(gridObject.generateNewValueArray(matches));
  // $(document).on('userMove', (e, pos1, pos2) => {
  //   console.log('User wants to move', pos1, pos2);
  // });
  // $(document).on('matchMade', (e, coordinates) => {
  //   console.log('Match detected', coordinates);
  // });
});
