import $ from "jquery";

$(function() {
  //--------Colors-------------------//
  var colors = [
    "red",
    "yellow",
    "purple",
    "green",
    "white",
    "#808000",
    "#808000",
    "#6AC37D",
    "#6AC3BB"
  ];

  var racer_odds_array = [
    { racer: 1, odd: 3.5, wins: 0, races: 0 },
    { racer: 2, odd: 10.5, wins: 0, races: 0 },
    { racer: 3, odd: 45.5, wins: 0, races: 0 }
  ];

  var player_bets = [];
  // ---------------Styles-------------//
  //-------------racers Flag----------//

  $(".racers").each(function(e, i) {
    const index = e + 1;
    $(this).append("<span>" + index + "</span>");
    $(this).css({
      backgroundColor: colors[e]
    });
  });

  //-----------variables------------------//
  var leaderboard = [];
  var race_number = 0;
  const track = $(".track");
  const racers = $(".racers");
  const start_button = $(".start-btn");

  const results_race = $(".race-results");
  const odds_racers = $("#racers-odds");
  const stats_racer = $("#racer-stats");

  const add_better = $("#add-better");
  const remove_better = $("#remove-better");

  const bet_players_list = $(".betting-players-list");

  //--------------Hadlers---------------//
  start_button.click(function() {
    const displayedtext = $(this).text();
    if (displayedtext === "Start") {
      race_number += 1;
      const racemeters = $(window).innerWidth() - 55;
      $(this).text("Reset");
      $(this).prop("disabled", true);
      $(this).addClass("disabled");
      enable_disable_Place_Bet_Btns(false);
      racers.each(function(e) {
        const time = Math.floor(Math.random() * 10) * 1000;
        generate_Array(time, e);
        start_Racers($(this), racemeters, time);
      });
      enable_Btn($(this));
    } else {
      $(this).text("Start");
      const racemeters = $(window).innerWidth() - 55;
      racers.each(function(e) {
        const time = 1000;
        restet_Race($(this), racemeters, time);
      });
      leaderboard = [];
      enable_disable_Place_Bet_Btns(true);
    }
  });
  //-----betting-----------------------//

  //-----add-betting user-------------//
  add_better.click(function(e) {
    var validation: boolean;
    const input = $(this).siblings(".better-name-input");
    const userName = $(this)
      .siblings(".better-name-input")
      .val()
      .toString();
    const parent = $(this).parent();
    const error = parent.children(".error");
    insert_Better("player-name", userName, validation, error);
    input.val("");
  });

  remove_better.click(e => {
    const last_index = bet_players_list.children().length - 1;
    if (last_index + 1 > 0) {
      const last_child = bet_players_list.children()[last_index];
      last_child.remove();
      $(".error").text("");
    }
  });

  //-----betting racer adjustment-----//

  window.addEventListener("click", e => {
    const element = e.target;
    const id = element.id;
    if (id === "add-racer") {
      add_Remove_Racer(e.target, true);
    }
    if (id === "remove-racer") {
      add_Remove_Racer(e.target, false);
    }

    if (id === "add-money") {
      add_Remove_Money(e.target, true);
    }

    if (id === "remove-money") {
      add_Remove_Money(e.target, false);
    }
    if (id === "place-bet-btn") {
      get_Bet_values(e.target);
    }
  });

  //--------------functions---------------//

  function insert_Better(
    class_name: string,
    userName: string,
    validation: boolean,
    error: JQuery
  ) {
    const children_length = bet_players_list.children().length;
    if (!!userName) {
      if (children_length >= 1) {
        validation = validate_name(class_name, userName);
      } else {
        add_New_better(bet_players_list, userName, racer_odds_array[0].odd);
        error.text("");
      }

      if (!!validation) {
        add_New_better(bet_players_list, userName, racer_odds_array[0].odd);
        error.text("");
      } else if (!validation && children_length >= 1) {
        error.text(
          `User name: ${userName} allready exists, please enter a different one.`
        );
      }
    } else {
      error.text("Please Enter Better's Name");
    }
  }

  function validate_name(element: string, name: string): boolean {
    var valid = true;
    var i: number;
    const nodelist_name = document.querySelectorAll("." + element + "");

    for (i = 0; i < nodelist_name.length; i++) {
      if (nodelist_name[i].innerHTML == name) {
        return false;
      }
    }

    return valid;
  }

  function add_New_better(element: JQuery, name: string, default_odds: number) {
    element.append(
      `<div class="player">
        <span class="player-name" >${name}</span>
          <div class="bet">
              <div class="racer-betting">
                <button class="bet-btn add-racer" id="add-racer">+</button>
                <span class="bet-racer">1</span>
                <button class="bet-btn remove-racer" id="remove-racer">-</button>
            </div>
          <div class="money">
              <button class="bet-btn" id="add-money">+</button>
              <span class="bet-number">10</span>£
              <button class="bet-btn" id="remove-money">-</button>
          </div>
          <button class="place-bet-btn" id="place-bet-btn">place bet</button>
          <div class="bet-results">
          <div class="multiplyer" id="multiplyer">${default_odds}</div>
              <div class="wins"></div>
              <div class="bet-result"></div>
          </div>
      </div>
      </div>`
    );
  }

  class Racer {
    index: number;
    value: number;
    constructor(value: number, index: number) {
      (this.index = index), (this.value = value);
    }
  }

  function sortby_min(a: number, b: number) {
    if (a < b) {
      return 1;
    } else {
      return -1;
    }
  }
  function sortby_max(a: number, b: number) {
    if (a > b) {
      return 1;
    } else {
      return -1;
    }
  }

  function enable_Btn(element: JQuery) {
    leaderboard.sort((a, b) => sortby_min(a.value, b.value));
    setTimeout(function() {
      element.prop("disabled", false);
      element.removeClass("disabled");
      result_Table_handler(results_race, race_number);
    }, leaderboard[0].value);
  }

  function enable_disable_Place_Bet_Btns(bool: boolean) {
    if (bool) {
      const place_btns = document.querySelectorAll(".place-bet-btn");
      place_btns.forEach(function(e) {
        //e.setAttribute("disabled", "false");
        //e.attributes[2].value = "false";
        //e.attributes[2].nodeValue = "false";
        e.classList.remove("disabled");
      });
    } else {
      const place_btns = document.querySelectorAll(".place-bet-btn");
      place_btns.forEach(function(e) {
        //e.setAttribute("disabled", "false");
        //e.attributes[2].nodeValue = "true";
        //e.attributes[2].value = "true";
        e.classList.add("disabled");
      });
    }
  }

  function start_Racers(element: JQuery, meters: number, time: number) {
    element.animate(
      {
        left: "+=" + meters + "px"
      },
      time
    );
  }

  function restet_Race(element: JQuery, meters: number, time: number) {
    element.animate(
      {
        left: "-=" + meters + "px"
      },
      time
    );
  }

  function generate_Array(value: number, racer_num: number) {
    const racer = new Racer(value, racer_num);
    leaderboard.push(racer);
    const leaderboardSorted = leaderboard.sort((a, b) =>
      sortby_max(a.value, b.value)
    );
    leaderboard = leaderboardSorted;
    return leaderboard;
  }

  function adjust_odds_by_loss(losses: number, racer: any) {
    if (losses > racer.wins + 1) {
      racer.odd += 2;
    }
  }

  function add_Racer_Sats(winner: boolean, leaderboard_winner?: number) {
    racer_odds_array.forEach(function(e) {
      e.races += 1;
      const losses = e.races - e.wins;
      if (winner) {
        if (e.racer === leaderboard_winner + 1) {
          e.wins += 1;
          const new_odd = e.odd / e.wins;

          if (new_odd < 1) {
            e.odd = 1.05;
          } else {
            e.odd = Number(new_odd.toFixed(2));
          }
        } else {
          adjust_odds_by_loss(losses, e);
        }
      } else {
        adjust_odds_by_loss(losses, e);
      }
    });
  }

  function display_results(
    winner: boolean,
    results_container: JQuery,
    leaderboard_first: number,
    race_number,
    leaderboard_second?: number
  ) {
    if (winner) {
      results_container.append(
        "<span>Race number: #" + race_number + "</span>"
      );
      results_container.append(
        `<span> 🏇The Winner is: ${leaderboard[0].index + 1} 🏇</span> `
      );

      leaderboard.forEach((i, e) => {
        const index = i.index + 1;
        const position = e + 1;
        const seconds = i.value / 1000;
        results_container.append(
          "<span>position: " +
            position +
            " time: " +
            seconds +
            "''" +
            "   player:  " +
            index +
            "</span>"
        );
      });
    } else {
      results_container.append(
        "<span>Race number: #" + race_number + "</span>"
      );
      results_container.append(
        `<span> 🏇We have a tie: ${leaderboard_first +
          1} and ${leaderboard_second + 1} 🏇</span> `
      );
    }
  }

  function result_Table_handler(element: JQuery, race_number: number) {
    leaderboard.sort((a, b) => sortby_max(a.value, b.value));
    results_race.empty();
    if (leaderboard[0].value === leaderboard[1].value) {
      display_results(
        false,
        element,
        leaderboard[0].index,
        race_number,
        leaderboard[1].index
      );

      add_Racer_Sats(true);
      print_Stats(stats_racer, true);
      if (player_bets.length > 0) {
        settle_bets(0, player_bets);
      }
    } else {
      display_results(true, element, leaderboard[0].index, race_number);
      add_Racer_Sats(true, leaderboard[0].index);
      if (player_bets.length > 0) {
        settle_bets(leaderboard[0].index + 1, player_bets);
      }
      print_Stats(stats_racer, true);
      print_Odds(odds_racers, true);
    }
  }

  function add_Remove_Racer(element, flag: boolean) {
    var racers_length: number, newtext: number;
    const span = element.parentElement.children[1];
    const spanTxt = parseInt(span.innerHTML);

    racers_length = track.children().length - 2;
    if (flag) {
      newtext = spanTxt + 1;
    } else {
      newtext = spanTxt - 1;
    }

    if (newtext <= racers_length && newtext > 0) {
      var racerodds = racer_odds_array.filter(function(e) {
        return e.racer == newtext;
      });

      const multiplyerTxt =
        element.parentElement.nextElementSibling.nextElementSibling
          .nextElementSibling.children[0];
      multiplyerTxt.innerHTML = String(racerodds[0].odd);
      span.innerHTML = String(newtext);
    }
  }

  function add_Remove_Money(element, flag: boolean) {
    var newtext: number;
    const span = element.parentElement.children[1];
    const spanTxt = parseInt(span.innerHTML);

    const max = 1000;
    if (flag) {
      newtext = spanTxt + 1;
    } else {
      newtext = spanTxt - 1;
    }

    if (newtext <= max && newtext > 5) {
      span.innerHTML = newtext;
    }
  }

  function get_Bet_values(element) {
    const bet_number = element.previousElementSibling.children[1];
    const better_name = element.parentElement.previousElementSibling;
    const bet_racer =
      element.previousElementSibling.previousElementSibling.children[1];
    const multiplyer = element.nextElementSibling.children[0];
    const wins = element.nextElementSibling.children[1];
    const result = element.nextElementSibling.children[2];

    place_Bet(bet_racer, bet_number, wins, better_name, multiplyer, result);
    element.setAttribute("disabled", "true");
    element.classList.add("disabled");
  }

  function place_Bet(
    racer: Element,
    money: Element,
    wins: Element,
    better_name: Element,
    multiplyer: Element,
    result: Element
  ) {
    const better_name_Txt = better_name.innerHTML;
    const racer_number = Number(racer.innerHTML);
    const money_number = Number(money.innerHTML);
    const multiplyer_number = Number(multiplyer.innerHTML);
    const winnings = money_number * multiplyer_number;
    //-- ----set Results--------///
    result.innerHTML = "Unsettled";
    const result_Txt = result.innerHTML;
    wins.innerHTML = String(winnings);

    player_bets.push({
      betterName: better_name_Txt,
      racer: racer_number,
      money: money_number,
      odd: multiplyer_number,
      wins: winnings,
      result: result_Txt
    });
    //console.log(player_bets);
  }

  function settle_bets(winner: any, player_bets) {
    player_bets.forEach(function(e) {
      if (e.racer === winner) {
        e.result = "Won";
      } else {
        e.result = "Lost";
      }
    });
    display_settled_bets(player_bets);
  }

  function display_settled_bets(player_bets) {
    const displayed_bets = document.querySelectorAll(".bet-result");
    displayed_bets.forEach(function(e) {
      const name =
        e.parentElement.parentElement.previousElementSibling.innerHTML;
      const existed_bet = player_bets.filter(o => {
        return o.betterName == name;
      });
      e.innerHTML = existed_bet[0].result;
      //console.log(existed_bet[0].result, existed_bet);
    });
  }

  function print_Odds(odds_racers: JQuery, reset: boolean) {
    if (reset) {
      odds_racers.empty();
      odds_racers.append(`<h6>Odds</h6>`);
      racer_odds_array.forEach(function(e) {
        odds_racers.append(`<span>Racer: ${e.racer}: ${e.odd}</span>`);
      });
    } else {
      racer_odds_array.forEach(function(e) {
        odds_racers.append(`<span>Racer: ${e.racer}: ${e.odd}</span>`);
      });
    }
  }

  function print_Stats(stats_racer: JQuery, reset: boolean) {
    if (reset) {
      stats_racer.empty();
      stats_racer.append(`<h6>Racer's Stats</h6>`);
      racer_odds_array.forEach(function(e) {
        stats_racer.append(`<span>Wins: ${e.wins}, races: ${e.races}</span>`);
      });
    } else {
      racer_odds_array.forEach(function(e) {
        stats_racer.append(`<span>Wins: ${e.wins}, races: ${e.races}</span>`);
      });
    }
  }
  print_Stats(stats_racer, false);
  print_Odds(odds_racers, false);
});
