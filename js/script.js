function randomNumber() {
  let text1 = "";
  let text2 = "";
  let alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase();
  let number = "0123456789";
  text1 += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  for (let i = 0; i < 4; i++) {
    text2 += number.charAt(Math.floor(Math.random() * number.length));
  }
  return text1 + text2;
}

let g_aniTimer = {};
let g_nItemPage = 0;
let g_fundItems = [];
let g_investorItems = [];
let g_bInvestorSign = false;

let g_postOptions = {
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    method: 'POST', 
    body: '{}'
};

function fundItemsPush(fund) {
    g_fundItems.push(fund);

    g_postOptions.body = JSON.stringify(fund);

    fetch("php/put_fund.php", g_postOptions).then(res => { 
        let resPromise = res.json(); 
        console.log(resPromise); 
        return resPromise;
    })
        .then(jsRes => console.log(jsRes))
        .catch (error => console.log('[ERROR] Request failed - ', res.text()));
}

function investorItemsPush(fund) {
    g_investorItems.push(fund);
    fund.email = 'ny030303@naver.com';
    g_postOptions.body = JSON.stringify(fund);

    fetch("php/put_investor.php", g_postOptions).then(res => { 
        let resPromise = res.json(); 
        console.log(resPromise); 
        return resPromise;
    })
        .then(jsRes => console.log(jsRes))
        .catch (error => console.log('[ERROR] Request failed - ', res.text()));
}

function toCurrency(value) {
  return Number(value).toLocaleString('kr', 'currency');
}

function toPercent(value) {
  return Math.floor(Number(value)) + '%';
}

function IsValidPassword(pwd) {
  let regEx1 = /[0-9]/;
  let regEx2 = /[a-zA-Z]/;
  let regEx3 = /[!@#$%^&*()]/;
  if (!regEx1.test(pwd) || !regEx2.test(pwd) || !regEx3.test(pwd) || pwd.length < 8) {
    alert("비밀번호는 8자리 이상 문자, 숫자, 특수문자('!@#$%^&*()')로 구성하여야 합니다.");
    return false;
  }
  else {
    return true;
  }
}

function isCompleteFund(endDate) {
  let nowTime = new Date().getTime();
  let limitTime = new Date(endDate).getTime(); // 24시간 * 60분 * 60초 * 1000밀리
  return (limitTime < nowTime);
}

function appendFundItem(fundListElm, fund, fundDataIdx) {
  let fundItemHtml = `
        <div class="form-control text-sz1-b">${fund.number}</div>
        <div class="form-control text-sz1-b">${fund.name}</div>
        <div class="fund-image"><span class="text-sz1-b">마감: ${fund.endDate}</span></div>
        <div class="flex-container">
            <div class="flex-item text-sz2"><div>모집금액</div><div>${toCurrency(fund.total)}</div></div>
            <div class="flex-item text-sz2"><div>현재금액</div><div>${toCurrency(fund.current)}</div></div>
            <div class="flex-item text-sz2"><div>D-Day</div><div>-50일</div></div>
        </div>
        <div class="graph"><div class="graph-bar" style="width: ${toPercent(fund.percent)}"></div></div>
        <div class="pull-left text-sz2">투자자수: 1명</div>
        <div class="pull-right text-sz2">${toPercent(fund.percent)}</div>
    `;

  let fundItem = document.createElement('div');
  fundItem.id = `listWrapper${fundDataIdx}`;
  fundItem.classList.add('listWrapper');

  if (isCompleteFund(fund.endDate)) {
    console.log("시간 지낫어!", new Date(), fund.endDate);
    // 그래프 안그림 (투자완료 그림 그려도 됨)
    fundItemHtml += `<div class="listBtnDiv"><button class="btn btn-off" disabled>모집완료</button></div>`;
    fundItem.style.borderColor = 'gray';
  }
  else {
    console.log("시간 안지낫어!", new Date(), fund.endDate);
    fundItemHtml += `<div class="listBtnDiv"><button class="btn">투자하기</button></div>`;
  }
  fundItem.innerHTML = fundItemHtml;
  fundListElm.append(fundItem);

  // 펀드 투자시간이 안지났으면
  console.log('fundItemHtml:', fundItemHtml);
  if (fundItem.style.borderColor !== 'gray') {
    //animationDrawCircle(fundItem.querySelector('canvas'), (fund.current * 100.0 / fund.total));
  }

  let popupIdx = fundDataIdx;
  $(fundItem).find('button').on("click", function (e) {
    $('#popupFundIdx').val(popupIdx);
    $('#popupFundNum').val(g_fundItems[popupIdx].number);
    $('#popupFundName').val(g_fundItems[popupIdx].name);
    $("#investPopup").css('display', "block");
  });
}

function loadFundJsonData(fundList1Elementm, callback) {
  if (window.location.protocol === 'file:') {
    console.log(window.location);
    let script = document.createElement('script');
    script.onload = (fileData) => callback(fileData);
    script.id = 'fundjson';
    script.type = 'text/javascript';
    script.src = 'js/fund.1.json';
    document.getElementsByTagName('head')[0].appendChild(script);
  }
  else {
    fetch("js/fund.json").then(res => res.json()).then(jsFunds => {
      console.log(jsFunds);
      callback(jsFunds);
    });
  }
}

function downInvestContract(idx) {
  let imgBg = new Image;
  let imgSign = new Image;
  let imageLoadCnt = 0;
  imgBg.src = 'images/funding.png';
  if (g_investorItems[parseInt(idx)].mySign) {
    // 투자자 싸인이 있는 경우
    imgSign.src = g_investorItems[parseInt(idx)].mySign;
  }
  else {
    // 초기값 입력으로 투자자의 싸인이 없는 경우
    imgSign.src = $('#signCanvas')[0].toDataURL('image/png');
  }

  function clickContract(imgCnt) {
    if (imgCnt < 2) return;

    console.log('imgCnt:', imgCnt, `[${imgBg.width}, ${imgBg.width}]`);
    let canvas = document.createElement('canvas');
    canvas.width = imgBg.width;
    canvas.height = imgBg.height;

    let ctx = canvas.getContext('2d');
    ctx.drawImage(imgBg, 0, 0);
    ctx.drawImage(imgSign, imgBg.width - imgSign.width, imgBg.height - imgSign.height);
    ctx.beginPath();
    ctx.font = "20px 맑은고딕";
    ctx.textAlign = "left";
    ctx.fillStyle = "#31333B";
    ctx.fillText(g_investorItems[parseInt(idx)].number, 325, 185 + 44 * 0);
    ctx.fillText(g_investorItems[parseInt(idx)].name, 325, 185 + 44 * 1);
    ctx.fillText(g_investorItems[parseInt(idx)].myName, 325, 185 + 44 * 2);
    ctx.fillText(g_investorItems[parseInt(idx)].myMoney, 325, 185 + 44 * 3);
    ctx.closePath();

    let downloadALink = document.createElement('a');
    downloadALink.download = 'InvestContract.png';
    downloadALink.href = canvas.toDataURL('image/png');
    downloadALink.click();
  }

  imgBg.onload = () => clickContract(++imageLoadCnt);
  imgSign.onload = () => clickContract(++imageLoadCnt);
}

function refreshFundItem(listWrapper, fund) {

  let rankFundDivs = listWrapper.find('div.form-control');
  console.log(rankFundDivs);
  rankFundDivs[0].innerHTML = fund.number;
  rankFundDivs[1].innerHTML = fund.name;

  listWrapper.find('span').innerHTML = fund.endDate;

  let flexItems = listWrapper.find('.flex-item');
  $(flexItems[0]).find('div')[1].innerHTML = toCurrency(fund.total);
  $(flexItems[1]).find('div')[1].innerHTML = toCurrency(fund.current);
  $(flexItems[2]).find('div')[1].innerHTML = toPercent(fund.percent);

  listWrapper.find('.graph-bar').css('width', toPercent(fund.percent));
  listWrapper.find('.pull-right').innerHTML = toPercent(fund.percent);
}

function refreshFundBox(fundBox) {
  showToastMsg('로딩완료 ' + JSON.stringify(fundBox[0].classList));
  if (fundBox.hasClass('mainScreen')) {
    let rankItems = [];
    g_fundItems.forEach((fund, idx) => {
      if (!isCompleteFund(fund.endDate)) {
        rankItems.push({per: fund.percent, idx: idx});
      }
    });
    rankItems.sort((a, b) => a.per > b.per ? -1 : 1);
    console.log(rankItems);

    for (let i = 0; i < 4 && i < rankItems.length; i++) {
      let fund = g_fundItems[rankItems[i].idx];

      refreshFundItem($(`#rankFund${i}`), fund);
    }
  }
  else if (fundBox.hasClass('view')) {
    $('.fundList1').html('');
    for (let i = 0; i < 10; i++) {
      appendFundItem($('.fundList1'), g_fundItems[g_nItemPage + i], g_nItemPage + i);
    }
    let maxPage = Math.floor(g_fundItems.length / 10);
    let pageHtml = `<div class="${g_nItemPage === 0 ? 'disable' : 'normal'}">＜</div>`;
    for (let i = 0; i <= maxPage; i++) {
      pageHtml += `<div class="${g_nItemPage === i ? 'active' : 'normal'}">${i + 1}</div>`;
    }
    pageHtml += `<div class="${g_nItemPage === maxPage ? 'disable' : 'normal'}">＞</div>`;

    console.log(pageHtml);
    $('.pagination').html(pageHtml);
    $('.pagination > div').on('click', (e) => {
      let clickDiv = $(e.target);
      if (clickDiv.hasClass('disable')) return;
      let value = clickDiv.html();
      switch (value) {
        case '＜':
          g_nItemPage--;
          break;
        case '＞':
          g_nItemPage++;
          break;
        default:
          g_nItemPage = Number(value) - 1;
          break;
      }
      refreshFundBox($('.view'));
    });
  }
  else if (fundBox.hasClass('investor')) {
    let investorHtml = '';
    g_investorItems.forEach((investor, idx) => {
      investorHtml = `
              <tr style="text-align: center">
                <td>${investor.number}</td>
                <td>${investor.name}</th>
                <td>${investor.myName}</td>
                <td style="text-align: right">${toCurrency(investor.myMoney)}</td>
                <td>
                  <progress max="100" value="${investor.percent}"></progress>            
                  <div style="display: inline-block; width: 50px"><span>${investor.percent}%</span></div>          
                </td>
                <td><button class="btn" onClick="downInvestContract(${idx})">다운로드</button></td>
              </tr>
          ` + investorHtml;
    });
    console.log(investorHtml);
    $('#investorInfos').html(investorHtml);
  }
}

function initSignCanvas(canvas) {
  let ptPrev = {x: 0, y: 0};
  let isDraw = false;
  let ctx = canvas.getContext('2d');

  ctx.beginPath();

  function getCanvasPoint(event) {
    return {x: event.offsetX, y: event.offsetY};
  }

  let eventListener = (event) => {
    // console.log(event);
    // console.log(event.type, event.offsetX, event.offsetY);
    switch (event.type) {
      case 'mousedown':
        ptPrev = getCanvasPoint(event);
        isDraw = true;
        break;

      case 'mousemove':
        if (isDraw) {
          let ptNew = getCanvasPoint(event);
          ctx.moveTo(ptPrev.x, ptPrev.y);
          ctx.lineTo(ptNew.x, ptNew.y);
          ctx.stroke();
          ptPrev = ptNew;
          g_bInvestorSign = true;
        }
        break;

      case 'mouseup':
        isDraw = false;
        break;
    }
  };
  canvas.onmousedown = eventListener;
  canvas.onmouseenter = eventListener;
  canvas.onmouseleave = eventListener;
  canvas.onmousemove = eventListener;
  canvas.onmouseout = eventListener;
  canvas.onmouseover = eventListener;
  document.onmouseup = eventListener;
}

function selectFundImage() {
  let inputFile = $('#fundImage')[0];
  $('#fundImage').on('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader();
      reader.onload = function (res) {
        console.log(res);
        $('.regDiv1st > img').attr('src', res.target.result);
            };
      reader.readAsDataURL(e.target.files[0]);
    }
  });
  inputFile.click();
}

function openSingUp(title) {
  $('#signUp > div > h1').html(title);
  $('#signUp > div > .form-group')[1].style.display = (title === '회원가입') ? 'block' : 'none';
  $('#signUp > div > .form-group')[3].style.display = (title === '회원가입') ? 'block' : 'none';
  $("#signUpPopup").css('display', "block");
  $('#signUp > div > div.btn-group > button').html(title);
}

function logout() {

}

function loginOrSignUp() {
  let formData = new FormData();
  let actionName = $('#signUp > div > div.btn-group > button').html();

  formData.append('email', $('#email').val());
  formData.append('password', $('#password').val());
  if (actionName === '회원가입') {
    formData.append('nick', $('#nick').val());
    formData.append('password2', $('#password2').val());
  }

  let options = {method: 'POST', body: formData};
  fetch((actionName === '회원가입') ? 'php/register_ok.php' : 'php/login_ok.php', options).then(res => {
        let html = res.json();
    console.log(html);
        html.then(jsRes => {
            console.log(jsRes);
            if (jsRes.result == 1) {
                closePopup('signUpPopup');
                $('.header-signup > span').html(`<b>${jsRes.user}</b>`);
                $('.header-login > span').html('로그아웃');
                showToastMsg(jsRes.user + '님 반갑습니다.');
                $.cookie('')
            }
        });
  });
}

function closePopup(popupId) {
  $(`#${popupId}`).css('display', 'none');
  if (popupId === 'investPopup') {
    let canvas = $('#signCanvas')[0];
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    g_bInvestorSign = false;
  }
  else { // signUpPopup
    let inputs = $('#signUp > div > div > input');
    for (let i = 0; i < 4; i++) {
      inputs[i].value = '';
    }
  }
}

function showToastMsg(msg) {
  let toastElm = $(document.createElement('div'));
  toastElm.addClass('toast');
  toastElm.css('display', 'none');
  toastElm.html(msg);
  $('body').append(toastElm);
  $('.toast').stop().fadeIn(500).delay(3000).fadeOut(500); //fade out after 3 seconds
  setTimeout(() => toastElm.remove(), 4000);
}

window.onload = function () {
  let navATag = $(".navigation a");
  let fundSection = ['mainScreen', 'view', 'Register', 'investor'];

    fetch("php/init.php").then(res => console.log(res.text()));

  // 화면 전환
  navATag.on("click", function (e) {
    fundSection.forEach((sectionName, i) => {
      if (this.innerText == navATag[i].innerText) {
        $(navATag[i]).addClass("activity");
        $(`.${sectionName}`).addClass("active");
        refreshFundBox($(`.${sectionName}`));
        console.log('FIND', this.innerText, navATag[i].innerText);
      }
      else {
        $(navATag[i]).removeClass("activity");
        $(`.${sectionName}`).removeClass("active");
        console.log('Not found:', this.innerText, navATag[i].innerText);
      }
    });
  });

  let fundInputs = [$("#impNumber")[0], $("#impName")[0], $("#impDate")[0], $("#impMoney")[0], $("#nowMoney")[0]];

  let fundList1Element = $(".fundList1");
  loadFundJsonData(fundList1Element, function (jsFunds) {
    g_fundItems = jsFunds;
    g_fundItems.forEach((fund, idx) => {
      fund.percent = fund.current * 100 / fund.total;
            fundItemsPush(fund);

      let investor = {
        number: fund.number,
        name: fund.name,
        total: fund.total,
        percent: fund.percent,
        myName: '홍길동',
        myMoney: fund.current,
        mySign: null
      };
            investorItemsPush(investor);// g_investorItems.push(investor);
    });
    navATag[0].click();

    fundInputs[0].value = randomNumber();

    $("#addFundButton").on("click", function (e) {
      if (fundInputs[1].value === "" || fundInputs[2].value === "" || fundInputs[3].value === "") {
        showToastMsg("누락된 값을 확인하시오.");
      }
      else {
        let endDate = fundInputs[2].value;
        let fund = {
          number: fundInputs[0].value,
          name: fundInputs[1].value,
          endDate: endDate.replace('T', ' '),
          total: parseInt(fundInputs[3].value),
          current: 0,
        };
        fund.percent = fund.current * 100 / fund.total;
                fundItemsPush(fund); // g_fundItems.push(fund);
        appendFundItem(fundList1Element, fund, g_fundItems.length - 1);
        showToastMsg("펀드가 추가되었습니다.");

        fundInputs[0].value = randomNumber();
        for (let i = 1; i < fundInputs; i++) {
          fundInputs[i].value = " ";
        }
        navATag[1].click();
      }
    });
  });

  initSignCanvas($('#signCanvas').get(0));

  $('#addInvestorBtn').on('click', (e) => {
    let fundIdx = parseInt($('#popupFundIdx')[0].value);
    let inName = $('#popupFundInvestName')[0].value;
    let inMoney = $('#popupFundInvestCost')[0].value;
    let signCanvas = $('#signCanvas')[0];

    if (inName.length === 0 && isNaN(Number(inMoney))) {
      showToastMsg('투자자와 투자금액을 정확히 입력해주세요.');
      return;
    }

    let fund = g_fundItems[fundIdx];

    let myInvestMoney = parseInt(inMoney);
    fund.current += myInvestMoney;
    fund.percent = fund.current * 100 / fund.total;

    refreshFundItem($(`#listWrapper${fundIdx}`), fund);

    for (let i = 0; i < g_investorItems.length; i++) {
      if (g_investorItems[i].number === fund.number && g_investorItems[i].myName === inName) {
        myInvestMoney += g_investorItems[i].myMoney;
        g_investorItems.splice(i, 1);
      }
    }

    let investor = {
      number: fund.number,
      name: fund.name,
      total: fund.total,
      percent: myInvestMoney * 100 / fund.total,
      myName: inName,
      myMoney: myInvestMoney,
      mySign: signCanvas.toDataURL()
    };
        investorItemsPush(investor); // g_investorItems.push(investor);
    closePopup();
  });
};
