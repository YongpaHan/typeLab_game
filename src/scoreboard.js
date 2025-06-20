import { loadScore } from './supabase.js';

//to 성훈님 myNickname에 현재 사용자의 닉네임을 넣으시면 됩니다 -예원
//닉네임 불러오기는 createScoreboard 함수 안으로 옮겼습니다. -성훈
console.log("현재 사용자의 닉네임:", window.me);
let scores = [];

const getRankLabel = (index) => {
    const suffix = ["ST", "ND", "RD"];
    const num = index + 1;
    return num <= 3 ? `${num}${suffix[num - 1]}` : `${num}TH`;
};

function recreateScoreboardContainer() {
    const scoreBoard = document.getElementById("score-board");
    const oldScoreboard = scoreBoard.querySelector(".scoreboard");
    
    if (oldScoreboard) {
        const newScoreboard = oldScoreboard.cloneNode(false);
        newScoreboard.innerHTML = `
            <div class="scoreboard-title">점수판</div>
            <div class="scoreboard-list">
                <div class="scoreboard-header">
                    <div>등수</div>
                    <div>닉네임</div>
                    <div>점수</div>
                </div>
                <div id="scoreboard-body">
                </div>
            </div>
            <div class="scoreboard-footer">스페이스 바를 누르면 다시 시작합니다.</div>
        `;
        
        scoreBoard.removeChild(oldScoreboard);
        scoreBoard.appendChild(newScoreboard);
        
    }
}

function createScoreboard() {
    const scoreboardBody = document.getElementById("scoreboard-body");
    const myNickname = window.me;
    
    if (!scoreboardBody) {
        console.log("scoreboardBody를 찾을 수 없음");
        return null;
    }
    
    scoreboardBody.innerHTML = "";
    
    let myRowElement = null;
    
    scores.forEach((entry, index) => {
        const row = document.createElement("div");
        row.className = "scoreboard-row";
        
        // 하이라이트 처리 기준을 데이터베이스에서의 ID로 변경했습니다. -성훈
        if (entry.id === window.myScoreId) {
            row.classList.add("highlight");
            row.id = "my-score-row";
            myRowElement = row;
        }
        
        row.innerHTML = `
            <div>${getRankLabel(index)}</div>
            <div>${entry.nickname}</div>
            <div>${(entry.score / 10).toFixed(1)} m</div>
        `;
        
        scoreboardBody.appendChild(row);
    });
    
    return myRowElement;
}

function executeScrollAnimation() {
    const container = document.querySelector(".scoreboard-list");
    const myRow = document.getElementById("my-score-row");
    
    if (!container || !myRow) {
        return;
    }
    
    console.log("scrollTop:", container.scrollTop);
    
    container.style.scrollBehavior = 'auto';
    container.scrollTop = 0;
    
    console.log("scrollTop:", container.scrollTop);
    
    setTimeout(() => {
        container.style.scrollBehavior = 'smooth';
        
        myRow.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
        
    }, 50);
}

async function displayFinalScore() {
    const scoreBoard = document.getElementById("score-board");
    scoreBoard.style.display = "flex";
    
    scores = await loadScore();
    console.log("점수 불러오기 완료:", scores);
    recreateScoreboardContainer();
    createScoreboard();
    
    setTimeout(() => {
        executeScrollAnimation();
    }, 100);
}

let isObserving = false;

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const scoreBoard = mutation.target;
            const currentDisplay = window.getComputedStyle(scoreBoard).display;
            
            if (currentDisplay !== 'none' && !isObserving) {
                isObserving = true;
                console.log("스코어보드가 나타남");
                
                setTimeout(() => {
                    displayFinalScore();
                }, 50);
                
            } else if (currentDisplay === 'none') {
                isObserving = false;
                console.log("스코어보드가 없어짐");
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const scoreBoard = document.getElementById("score-board");
    if (scoreBoard) {
        observer.observe(scoreBoard, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
    }
});

if (document.readyState !== 'loading') {
    const scoreBoard = document.getElementById("score-board");
    if (scoreBoard) {
        observer.observe(scoreBoard, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        const scoreBoard = document.getElementById("score-board");
        if (scoreBoard && window.getComputedStyle(scoreBoard).display !== 'none') {
            e.preventDefault();
            executeScrollAnimation();
        }
    }
});

window.resetScrollPosition = function() {
    isObserving = false;
};