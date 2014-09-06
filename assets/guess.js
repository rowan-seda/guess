var guess = {
  noOfTurns       : 10,
  noOfTurnsMin    : 5,
  noOfTurnsMax    : 12,
  noOfOptions     : 6,
  noOfOptionsMin  : 4,
  noOfOptionsMax  : 10,
  pegsPerPlay     : 4,
  pegsPerPlayMin  : 4,
  pegsPerPlayMax  : 6,
  options         : ['r','g','b','y','k','w','o','v','c','s'],
  currentPegs     : 0,
  currentTurn     : 1,
  solution        : [],
  settings        : {
    noOfTurns   : 0,
    noOfOptions : 0,
    pegsPerPlay : 0
  },
  numbers : ['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'],

  init : function() {
    this.setDefaultSettings();
    this.resetBoard();
    this.activateButtons();

    $('.hidden').hide().removeClass('hidden');
  },

  setDefaultSettings : function() { 
    var settings = guess.settings;
    var keys = Object.keys(settings);

    $.each(keys, function(i,key){
      settings[key] = guess[key];
    });

  },

  setNewSettings : function(event) {
    var
      settings = guess.settings,
      settingsKeys = Object.keys(settings),
      allInputs = $('#settingsForm').find('input');
    
    allInputs.each(function () {
      var
        input = $(this),
        key = input.attr('name');

      if ($.inArray(key, settingsKeys) >= 0) {
        settings[key] = parseInt(input.val());
      }
    });

    $('.rules-slots').html(guess.numbers[settings.pegsPerPlay]);
    $('.rules-turns').html(guess.numbers[settings.noOfTurns]);
  },

  activateButtons : function(){
    $('#clear').click(function() {
      guess.resetBoard();
    });
    $('#rules').click(this.openPopup);
    $('#settings').click(this.settingsPopup);
  },

  populateSettings : function() {
    var settings = guess.settings;

    //set to current values
    $('#noOfTurnsSlider').val(settings.noOfTurns);
    $('#noOfOptionsSlider').val(settings.noOfOptions);
    $('#pegsPerPlaySlider').val(settings.pegsPerPlay);
    
    $('#noOfTurnsVal').html(settings.noOfTurns);
    $('#noOfOptionsVal').html(settings.noOfOptions);
    $('#pegsPerPlayVal').html(settings.pegsPerPlay);

    $('#noOfTurnsSlider').on('input',function() {
      $('#noOfTurnsVal').html($(this).val());
    });
    $('#noOfOptionsSlider').on('input',function() {
      $('#noOfOptionsVal').html($(this).val());
    });
    $('#pegsPerPlaySlider').on('input',function() {
      $('#pegsPerPlayVal').html($(this).val());
    });
  },

  settingsPopup : function(event) {
    guess.openPopup(event);
    $(document) .off('click');

    guess.populateSettings();

    $('#defaultSettings').click(function (){
      guess.setDefaultSettings();
      guess.populateSettings();
      $(this).off('click');
    });

    $('#cancelSettings').click(function (event) {
      $('.popup').hide();
      $(this).off('click');
    });

    $('#settingsForm').submit(function (event) {
      event.preventDefault();
      guess.setNewSettings(event);
      $('.popup').hide();
      $(this).off('submit');
      guess.resetBoard();
    });
  },

  openPopup : function(event) {
    $('.popup').hide();
    var popup = $( '#' + event.target.id + "Popup" );
    popup.show();
    event.stopPropagation();
    $(document).on('click', function(){
      popup.hide();
      $(document).off('click');
    });
  },

  buildBoard : function() {
    var 
      pegHoles = '', hintHoles = '',
      settings = this.settings,
      hintsClass = 'rowHints';

    if (settings.pegsPerPlay > 4)
      hintsClass += ' rowHintsPlus'

    for (i = 0; i < settings.pegsPerPlay; i++) {
      pegHoles += '<div class="pegHole"></div>';
      hintHoles += '<div class="hintHole"></div>';
    }
    for (i = 0; i < settings.noOfTurns; i++) {
      $('#field').append($('<div class="pegRow">'+pegHoles+'</div><div class="'+hintsClass+'">'+hintHoles+'</div><hr />'));
    }
    for (i = 0; i < (settings.noOfOptions - settings.noOfTurns); i++) {
      $('#field').append($('<div class="noRow"></div>'));
    }

    var availableOptions = []
    var i = 1
    this.options.forEach(function(color){
      var element = '<div class="peg ' + color+ '" value=' + color+ ' />';
      if (i <= settings.noOfOptions)
        availableOptions.push(element);
      i += 1;
    });

    var firstRow = $('div.pegRow:nth-child(1)');
    
    firstRow.addClass('currentRow');
    this.makeRowDroppable(firstRow);

    $('#dugout').html(availableOptions.join(''));
    for (i = 0; i < (settings.noOfTurns - settings.noOfOptions); i++) {
      $('#dugout').append($('<div class="noPeg"></div>'));
    }

    $('.peg').draggable({
      revert : 'invalid',
      revertDuration: 200,
      containment: '#board',
      helper: "clone"
    });
  },

  makeRowDroppable : function(row) {
    row.children('.pegHole').droppable({
      hoverClass: 'pegHoleHighlight',
      revert: true,
      drop: function( event, ui ) {
        var
          val = $(ui.draggable.context.attributes.value),
          peg = $(this),
          isSet = peg.hasClass('peg')

        peg.removeClass().addClass('pegHole ui-droppable').addClass('peg ' + val.val());
        
        peg.val(val.val());

        if ( isSet === false)
          guess.currentPegs += 1;

        peg.click(function(){
          peg.removeClass().addClass('pegHole ui-droppable');
          guess.currentPegs -= 1;
        })

        if (guess.currentPegs == guess.settings.pegsPerPlay) {
          guess.checkGuess();
        }


      }
    });
  },

  resetBoard : function() {
    this.currentPegs = 0;
    this.currentTurn = 0;
    this.newSolution();
    $(field).children().remove();
    this.buildBoard();
  },

  newSolution : function () {
    var newSolution = [],
      settings = guess.settings;
    for ( var i = 0; i < settings.pegsPerPlay; i++ ) {
      var randomOption = this.options[Math.floor(Math.random() * settings.noOfOptions)]
      newSolution.push(randomOption);
    }
    this.solution = newSolution;
  },

  checkGuess : function () {
    var key = [], score = 0,
      currentRow = $('.currentRow'),
      test = this.solution.slice(0),
      proposal = [],
      settings = guess.settings;

    currentRow.removeClass('currentRow');
    currentRow.children().off('click');
    this.currentPegs = 0;

    //check for exact matches
    //todo: make this its own function
    for ( var i = 0; i < settings.pegsPerPlay; i++ ) {
      proposal.push($(currentRow.children('.peg')[i]).val());
      if (proposal[i] === test[i]) {
        key.push('r');
        test[i] = null;
        proposal[i] = null;
        score += 1
      }
    }

    //check for exists in solution
    //todo: make this its own function
    for ( var i = 0; i < settings.pegsPerPlay; i++ ) {
      var isElsewhere = jQuery.inArray(proposal[i], test );
      if (proposal[i] !== null &&  isElsewhere >= 0 ) {
        test[isElsewhere] = null;
        key.push('w');
      }
    }

    //guess.addHints(key);
    //todo: make this its own function
    if (guess.currentTurn < settings.noOfTurns - 1) {
    var currentKey = $( $('div.rowHints')[guess.currentTurn] );
      for ( var i = 0; i < settings.pegsPerPlay; i++ ) {

        if (key[i] === "r" || key[i] === "w") {
          $(currentKey.children('.hintHole')[i]).addClass(key[i]);
        }
      }
    } else {
      guess.solution = [];
      alert('You\'ve Lost!!');
      guess.resetBoard();
    }
    
    if (score === settings.pegsPerPlay) {
      alert('You\'ve Won!!!');
      guess.resetBoard();
    } else {
      guess.nextTurn();  
    }

    return score;
  },

  nextTurn : function() {
    var prevRow = $($('div.pegRow')[guess.currentTurn]);
    prevRow.children().droppable('disable');
    //todo: make these draggable

    guess.currentTurn += 1;
    
    $($('div.field')[guess.currentTurn]).children();
    var currentRow = $($('div.pegRow')[guess.currentTurn]);
    currentRow.addClass('currentRow');
    this.makeRowDroppable(currentRow);
  }
}

$(document).ready(function() {
  guess.init();
})