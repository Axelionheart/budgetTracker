//model controller
var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function(totalIncome){

    if(totalIncome > 0){
      this.percentage = Math.round((this.value / totalIncome) * 100);
    }else{
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current, index, array) {
      sum = sum + current.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, id;

      //create new Id
      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0;
      }

      //add new item
      if (type === 'exp') {
        newItem = new Expense(id, des, val);
      } else if (type === 'inc') {
        newItem = new Income(id, des, val);
      }

      //push it into data structure
      data.allItems[type].push(newItem);

      //return new newItem
      return newItem;
    },

    calculateBudget: function() {

      calculateTotal('exp');
      calculateTotal('inc');

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function(){

      data.allItems.exp.forEach(function(current){
        current.calculatePercentage(data.totals.inc);
      })
    },

    getPercentages :function(){

      var allPercentages = data.allItems.exp.map(function(current){
        return current.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpense: data.totals.exp,
        percentage: data.percentage
      };
    },

    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    testing: function() {
      console.log(data);
    }
  };
})();

//view controller
var uIController = (function() {

  var domStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentageLabel:'.item__percentage',
    dateLabel:'.budget__title--month'
  };

  var formatNumber = function(number,type){
    var splitNumber,int,dec,type,sign;

    number = Math.abs(number);
    number = number.toFixed(2);

    splitNumber = number.split('.');

    int = splitNumber[0];
    if(int.length > 3){
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = splitNumber[1]

    return (type === 'exp' ? '-': '+') + int + '.' +  dec;
  };

  var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

  return {
    getInput: function() {
      return {
        type: document.querySelector(domStrings.inputType).value,
        description: document.querySelector(domStrings.inputDescription).value,
        value: parseFloat(document.querySelector(domStrings.inputValue).value)
      };
    },

    deleteListItem:function(selectorID){

      var element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
      document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalIncome,'inc');
      document.querySelector(domStrings.expenseLabel).textContent = formatNumber(obj.totalExpense,'exp');

      if (obj.percentage > 0) {
        document.querySelector(domStrings.percentageLabel).textContent = obj.percentage;
      } else {
        document.querySelector(domStrings.percentageLabel).textContent = '----';
      }

    },

    displayMonth: function(){
      var now, year, month;

      now = new Date();
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(domStrings.dateLabel).textContent = month + '/' +  year;

    },

    displayPercentages: function(percentages){

      var fields = document.querySelectorAll(domStrings.expensesPercentageLabel);

      nodeListForEach(fields,function(current, index){

        if(percentages[index] > 0){
          current.textContent = percentages[index] + '%';
        }else{
          current.textContent = '----';
        }
      });
    },

    changeType: function(){

      var varFields = document.querySelectorAll(
        domStrings.inputType + ', ' +
        domStrings.inputDescription + ', ' +
        domStrings.inputValue);

        nodeListForEach(varFields, function(current){
          current.classList.toggle('red-focus');
        });

        document.querySelector(domStrings.inputButton).classList.toggle('red');
    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    getDOMStrings: function() {
      return domStrings;
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;

      if (type === 'inc') {
        element = domStrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = domStrings.expenseContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //repalce the placeholder with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description)
      newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

      //Insert HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    }
  };
})();

//app controller
var controller = (function(budgetCtrl, uiCtrl) {

  var setupEventListeners = function() {
    var dom = uiCtrl.getDOMStrings();

    document.querySelector(dom.inputButton).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {

      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(dom.inputType).addEventListener('change', uiCtrl.changeType);

  };

  var updatePercentages = function(){

      budgetCtrl.calculatePercentages();

      var percentages = budgetCtrl.getPercentages();

      uiCtrl.displayPercentages(percentages);
  };

  var updateBudget = function() {

    //calculete the budget
    budgetCtrl.calculateBudget();
    //Return the budget
    var budget = budgetCtrl.getBudget();
    //update the UI
    uiCtrl.displayBudget(budget);

  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, id;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {

      splitID = itemID.split('-');
      type = splitID[0];
      id = parseInt(splitID[1]);

      //delete the item from the data structure
      budgetCtrl.deleteItem(type,id);
      //delete the item from the UI
      uiCtrl.deleteListItem(itemID);
      //calculate and update new budget
      updateBudget();
      //calculate and update updatePercentages
      updatePercentages();
    }
  };

  var ctrlAddItem = function() {
    var input, newItem;
    //get field input data
    input = uiCtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //add the input to the budget budgetController
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      //add item to the UI
      uiCtrl.addListItem(newItem, input.type);
      //clear fieldsArr
      uiCtrl.clearFields();
      //calculate and updateBudget
      updateBudget();
      //calculate and update percentage
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log("Startign application...");
      uiCtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpense: 0,
        percentage: -1
      });
      uiCtrl.displayMonth();
      setupEventListeners();
    }
  };

})(budgetController, uIController);

controller.init();
