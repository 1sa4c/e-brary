var burger_closed = document.getElementsByClassName('closed-icon')[0]
var burger_open = document.getElementsByClassName('open-icon')[0]
var menu = document.getElementsByClassName('nav-show')[0]

burger_closed.addEventListener('click', function() {
    menu.classList.add('open')
})

burger_open.addEventListener('click', function() {
    menu.classList.remove('open')
})