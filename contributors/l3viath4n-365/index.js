$(document).ready(function () {
  const projectCards = $('.project-card');
  const urls = [
    'https://www.youtube.com/@L3viath4n_gamingg',
    'https://www.youtube.com/@StackSentinel',
    'https://github.com/L3viath4n-365',
    'https://github.com/L3viath4n-365/EJS--RESTful-ROUTES-and-git-practice-challenge-from-gemini'
  ];

  projectCards.each(function (index) {
    $(this).on('click', function (e) {
      e.preventDefault();
      window.location.href = urls[index];
    });

    $(this).on('focus', function () {
      $(this).css('text-decoration', 'underline');
    });

    $(this).on('blur', function () {
      $(this).css('text-decoration', 'none');
    });
  });


  $(".skill-group:first").click(function () {
    window.open("https://www.udemy.com/course/the-complete-web-development-bootcamp/learn/lecture/12384214#overview", "_blank");
  });

  $(".sec-group").click(function () {
    window.open("https://www.udemy.com/course/learn-python-and-ethical-hacking-from-scratch/?couponCode=KEEPLEARNING", "_blank");
  });
});

function updateClock() {
  const now = new Date();
  $("#clock").text(now.toLocaleTimeString('en-US', { hour12: false }));
}
setInterval(updateClock, 1000);
updateClock();

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

$(".fade-up").each(function (index, el) {
  observer.observe(el);
});

$(".skills-grid, .projects-grid, .about-stats").each(function (index, grid) {
  $(grid).find('.fade-up').each((i, el) => {
    el.style.transitionDelay = `${i * 80}ms`;
  });
});