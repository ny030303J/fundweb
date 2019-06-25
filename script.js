let g_bUseLocalData = false;
let g_FundArr = [];
let g_fundView = [];
let g_fundInvestor = [];

Number.prototype.toCurrency = function() {
  return Number(this.valueOf()).toLocaleString('kr', 'currency');
};
String.prototype.toCurrency = Number.prototype.toCurrency;

function randomNumber() {
  let text1 = "";
  let text2 = "";

  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let number = "0123456789";
  console.log(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
  text1 += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  for (let i = 0; i < 4; i++) {
    text2 += number.charAt(Math.floor(Math.random() * number.length));
  }
  return text1 + text2;
}

function gotoAddFund() {
  // var ele =document.getElementById('test'); // 변수에 엘리먼트 저장
  let navATag = $(".nav-lists-a");

  navATag[2].click();
}

function getFundRank(callback) {
  let fundRank = [];
  if (g_bUseLocalData) {
    g_FundArr.forEach((value, idx) => fundRank.push({
      percent: Math.floor(100 * value.current / value.total),
      index: idx,
      current: g_FundArr[idx].current,
      total: g_FundArr[idx].total
    }));
    fundRank.sort((a, b) => a.percent > b.percent ? -1 : 1);
    fundRank.splice(4, fundRank.length);
    callback(fundRank);
  }
  else {
    fetch("/php/get_rankfunds.php").then(value => value.json()).then(jsValue => {
      console.log('get_rankfunds:', jsValue);
      callback(jsValue.data);
    });
  }
}

function getFundData(page, callback) {
  let fundDatas = [];
  if (g_bUseLocalData) {
    for( let i=(page * 10); i<g_FundArr.length; i++ ) {
      fundDatas.push(g_FundArr[i]);
    }
  }
  else {
    fetch("/php/get_funds.php").then(value => value.json()).then(jsValue => {
      console.log('get_funds:', jsValue);
      callback(jsValue.data);
    });
  }
}


function refreshFundBox(fundBox) {
  console.log('refreshFundBox:', fundBox[0].id);
  switch (fundBox[0].id) {
    case 'home': {
      // 랭킹 sort, 랭킹 초기화
      getFundRank(rankDatas => {
        rankDatas.forEach((fund, i) => {
          console.log(fund);
          let rankDiv = $(`#rankFund${i}`).find('.rankText');
          rankDiv[0].innerHTML = `펀드번호 : ${fund.number}`;
          rankDiv[1].innerHTML = `창업펀드명 : ${fund.name}`;
          rankDiv[2].innerHTML = `모집마감일 : ${fund.endDate || fund.enddate}`;
          rankDiv[3].innerHTML = `모집금액 : ${fund.total.toCurrency()}`;
          rankDiv[4].innerHTML = `현재금액 : ${fund.current.toCurrency()}`;
        });

        // animationDrawCircle(rankWrappers[i].querySelector("canvas"), fund.percent)
        rankDatas.forEach((rankData, i) => {
          console.log(i);
          $(`#rankFund${i} .graph-bar`).css({width: `${rankData.percent}%`, transition: `width 3s`});
        });
      });
      break;
    }

    case 'view': {
      //펀드들 에니메이션 초기화
      // for (let i = 0; i < g_FundArr.length; i++) {
      //   console.log(i);
      //   $(`#rankFund${g_FundArr[i].number} .graph-bar`).css({
      //     width: `${Math.floor(100 * g_FundArr[i].current / g_FundArr[i].total)}%`,
      //     transition: `width 3s`
      //   });
      // }
      let fundList1 = $(".fundList1");
      fundList1.empty();
      getFundData(fundDatas => {
        fundDatas.forEach((value, idx) => {
          let divTag = document.createElement('div');
          divTag.innerHTML =
            `<div id="viewFund${value.number}" class="viewListWrapper">
            <div class="graph">
              <div class="graph-bar"></div>
            </div>
            <div class="form-control1 text-sz1-b" style="font-weight: bold;">${value.number}</div>
            <div class="form-control1 text-sz1-b">${value.name}</div>
            <div class="fund-image"><span class="text-sz1-b">${value.endDate}</span></div>
            <div class="flex-container">
              <div class="flex-item text-sz2">
                <div>모집금액 : ${value.total}</div>
              </div>
              <div class="flex-item text-sz2">
                <div>현재금액 : ${value.current}</div>
              </div>
              <div class="flex-item text-sz2">
                <div>모집율 : ${Math.floor(100 * value.current / value.total)}%</div>
              </div>
            </div>
            <div class="pull-left text-sz2">투자자수: 5명</div>
            <div class="pull-right text-sz2">D-10</div>
            <button id="addFundButton">투자하기</button>
            <button id="addFundButton">투자자보기</button>
            <button id="addFundButton">상세보기 </button>
          </div>`;
          fundList1.appendChild(divTag);
        });
      });
      break;
    }

    case 'addFund': {
      break;
    }

    case 'investors': {
      break;
    }
  }
  if (fundBox.hasClass('Home')) {


  }
  else if (fundBox.hasClass('View')) {

  }
  else if (fundBox.hasClass('AddFund')) {
    // 
  }
  else if (fundBox.hasClass('Investors')) {

  }
}

function getJsonFund(callBack) {
  fetch("fund.json").then(value => value.json()).then(JsonValue => {
    // console.log(JsonValue);
    callBack(JsonValue);
  });
}

window.onload = function () {
  let navATag = $(".nav-lists-a");

  pages = ['Home', 'View', 'AddFund', 'Investors'];

  getJsonFund((jsvalue) => {
    // let a = jsvalue[0].endDate.replace("-", "");
    // console.log(a);
    console.log(Date.now());
    // jsvalue[1].number;
    g_FundArr = jsvalue;
    navATag[0].click();
  });
  console.log(g_FundArr);

  navATag.on("click", function (e) {
    for (let i = 0; i < g_FundArr.length; i++) {
      console.log("이곳은 메인초기화");
      $(`#rankFund${i} .graph-bar`).css({width: "0%", transition: "0s"});
    }
    for (let j = 0; j < g_FundArr.length; j++) {
      console.log("이곳은 뷰초기화");
      $(`#rankFund${g_FundArr[j].number} .graph-bar`).css({width: "0%", transition: "0s"});
    }

    pages.forEach((sectionName, i) => {
      console.log(this.innerText, sectionName);
      if (this.innerText === navATag[i].innerText) {
        $(navATag[i]).addClass("active");
        $(`.${sectionName}`).addClass("activity");
        refreshFundBox($(`.${sectionName}`));
        // console.log('FIND', this.innerText, navATag[i].innerText);
      }
      else {
        $(navATag[i]).removeClass("active");
        $(`.${sectionName}`).removeClass("activity");
        // console.log('Not found:', this.innerText, navATag[i].innerText);
      }
    });
  });

  $(window).on("scroll", function (e) {
    let nowWTop = parseInt($(window).scrollTop());
    let nowWHeight = parseInt($(window).height());
    // console.log(nowWTop, nowWHeight)
    if (nowWTop >= 1) {
      $("#header-top").css({height: "0px"});
      $("#header").css({backgroundColor: "rgba(1,1,1,0)"});
      $("#header-bottom-wrap").css({backgroundColor: "#fff"});
      $("#logo").css({color: "#333"});
      $(".nav-lists-a").css({color: "#333"});
    }

    if (nowWTop <= 0) {
      $("#header-top").css({height: "44px"});
      $("#header-bottom").css({backgroundColor: "rgba(1,1,1,0)", color: "#fff"});
      $("#header-bottom-wrap").css({backgroundColor: "rgba(1,1,1,0)"});
      $("#logo").css({color: "#fff"});
      $(".nav-lists-a").css({color: "#fff"});
    }
  });

  let addFundInp = document.querySelectorAll(".form-group .form-control");
  addFundInp[0].value = randomNumber();
  console.log(addFundInp[0].value);
};