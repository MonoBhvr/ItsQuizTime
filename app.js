// ▼▼▼ 1단계에서 복사한 자신의 Firebase 구성 정보 붙여넣기 ▼▼▼
const firebaseConfig = {
    apiKey: "AIzaSyBLXexivC8jzDR0plFrk3hoG7zpYAzRwq4",
    authDomain: "kahoot-ppt.firebaseapp.com",
    databaseURL: "https://kahoot-ppt-default-rtdb.firebaseio.com",
    projectId: "kahoot-ppt",
    storageBucket: "kahoot-ppt.firebasestorage.app",
    messagingSenderId: "421031626200",
    appId: "1:421031626200:web:47d21a3b938862b0381ead"
};

// Firebase 앱 초기화
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 전역 변수
let userId;
let userName;
let userScore = 0; // ★★★ 새로 추가: 사용자의 점수를 추적하는 변수
let currentQuestion = 0;
let answered = false;

//정답 변수


// DOM 요소 가져오기
const loginContainer = document.getElementById('login-container');
const gameContainer = document.getElementById('game-container');
const nameInput = document.getElementById('name-input');
const joinButton = document.getElementById('join-button');
const userNameDisplay = document.getElementById('user-name-display');
const statusMessage = document.getElementById('status-message');
const answerButtons = Array.from(document.querySelectorAll('.answer-btn'));
const userScoreDisplay = document.getElementById('user-score-display');

// listenToUserScore 함수를 아래 코드로 교체
function listenToUserScore() {
    if (!userId) return;
    const userScoreRef = database.ref('users/' + userId + '/score');
    userScoreRef.on('value', (snapshot) => {
        const score = snapshot.val();
        userScore = score !== null ? score : 0; // userScore 전역 변수 업데이트

        // ★★★ 변경점: 화면의 점수 표시 업데이트 ★★★
        userScoreDisplay.textContent = userScore;
        console.log("현재 점수 업데이트:", userScore);
    });
}


// -- 이벤트 리스너 --

// 참여하기 버튼 클릭
joinButton.addEventListener('click', () => {
    userName = nameInput.value.trim();
    if (!userName) {
        alert('이름을 입력해주세요.');
        return;
    }
    //사용 가능 이름 리스트 선언
    const canuseNames = [고은혁, 김라은, 라은, 김무준, 무준, 김소은, 소은, 김진교, 진교, 김준원, 준원, 문성혁, 성혁, 박재현, 재현, 박진우, 진우, 박현준, 현준, 백재원, 재원, 심민섭, 민섭, 여지민, 지민, 여지훈, 지훈, 우리나, 리나, 유도현, 도현, 이강현, 강현, 이승찬, 승찬, 이은채, 은채, 이한영, 한영, 이현서, 현서, 이현승, 현승, 임다환, 다환, 임우진, 우진, 조성빈, 성빈, 최재혁, 재혁, 최태현, 태현, 최현서];
    if(!(UserName in canuseNames)){
        alert('사용할 수 없는 이름입니다.');
        return;
    }

    userId = 'user_' + Date.now();

    // Firebase에 사용자 정보 등록
    database.ref('users/' + userId).set({
        name: userName,
        score: 0 // 초기 점수는 0
    });

    // 화면 전환 및 게임 상태 리스너 시작
    userNameDisplay.textContent = userName;
    loginContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    listenToGameState();
    // ★★★ 새로 추가: 점수 변화를 감지하는 리스너 시작 ★★★
    listenToUserScore();
});

// 답변 버튼 클릭
answerButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (answered || button.disabled) return;

        answered = true;
        const choice = button.dataset.choice;

        const answerRef = database.ref(`results/Q${currentQuestion}/${choice}/${userId}`);
        answerRef.set(true)
            .then(() => {
                statusMessage.textContent = "답변이 제출되었습니다!";
                button.classList.add('selected');
                disableAllButtons();
            });
    });
});

// ★★★ 새로 추가: 페이지 종료 이벤트 리스너 ★★★
// 사용자가 창을 닫거나 새로고침할 때 실행
window.addEventListener('beforeunload', (event) => {
    // 만약 사용자가 참여했고(userId가 존재), 점수가 0점이라면
    if (userId && userScore === 0) {
        // 데이터베이스에서 해당 사용자 정보를 삭제합니다.
        database.ref('users/' + userId).remove();
    }
});


// -- 함수 --

// Firebase의 gameState 실시간 감시
function listenToGameState() {
    const gameStateRef = database.ref('gameState');
    gameStateRef.on('value', (snapshot) => {
        const state = snapshot.val();
        if (!state) return;

        currentQuestion = state.currentQuestion;

        if (state.isAnswerable === true) {
            statusMessage.textContent = `문제 #${currentQuestion} 시작!`;
            enableAllButtons();
        } else {
            statusMessage.textContent = "다음 문제를 기다리는 중...";
            disableAllButtons();
        }
    });
}

function enableAllButtons() {
    answered = false;
    answerButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('selected');
    });
}

function disableAllButtons() {
    answerButtons.forEach(btn => {
        btn.disabled = true;
    });
}
