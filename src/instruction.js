const container = document.getElementById('stripContainer');
const colors = ['#38C0FC', '#38C0FC', '#E4E4E4', '#FAFAFA'];
for (let i = 0; i < 54; i++) {
const div = document.createElement('div');
div.classList.add('strip');
div.style.top = `${i * 15}px`;

if (i === 0 || i === 1) {
    div.classList.add('strip-blue');
} else {
    div.classList.add(i % 2 === 0 ? 'strip-gray' : 'strip-white');
}
 
container.appendChild(div);
}

