document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------------------------
   * 1. ELEMENT SELECTIONS (Preserving starter code IDs)
   * ---------------------------------------------------------------------------- */
  const yearSpan = document.getElementById('year');
  const themeBtn = document.getElementById('theme-btn');
  const contactBtn = document.getElementById('contact-btn');
  const contactActionBtn = document.getElementById('contact-action-btn');

  const menuToggle = document.getElementById('menu-toggle');
  const navContainer = document.querySelector('.nav-container');
  const navLinks = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section[id]');

  const bubbleAlert = document.getElementById('bubble-alert');
  const bubbleCloseBtn = document.getElementById('bubble-close-btn');

  let bubbleTimer = null;
  let scrollAnimationFrame = null;

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;

    event.preventDefault();
    history.pushState(null, '', link.hash);

    if (scrollAnimationFrame !== null) {
      cancelAnimationFrame(scrollAnimationFrame);
    }

    const scrollElement = document.scrollingElement;
    const targetMargin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const startPosition = scrollElement.scrollTop;
    const endPosition = Math.max(
      0,
      startPosition + target.getBoundingClientRect().top - targetMargin
    );
    const distance = Math.abs(endPosition - startPosition);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion
      ? Math.min(380, Math.max(240, distance * 0.25))
      : Math.min(1100, Math.max(500, distance * 0.45));
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = progress < 0.5
        ? 4 * progress ** 3
        : 1 - ((-2 * progress + 2) ** 3) / 2;

      scrollElement.scrollTop = startPosition + (endPosition - startPosition) * easedProgress;

      if (progress < 1) {
        scrollAnimationFrame = requestAnimationFrame(animateScroll);
      } else {
        scrollAnimationFrame = null;
      }
    };

    scrollAnimationFrame = requestAnimationFrame(animateScroll);

    if (!target.matches('section[id]')) return;

    const animateArrival = () => {
      target.classList.remove('section-arrival');
      void target.offsetWidth;
      target.classList.add('section-arrival');
    };

    if ('IntersectionObserver' in window) {
      const arrivalObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          arrivalObserver.disconnect();
          clearTimeout(observerTimeout);
          animateArrival();
        }
      }, { threshold: 0.1 });

      arrivalObserver.observe(target);
      const observerTimeout = setTimeout(() => arrivalObserver.disconnect(), 5000);
    } else {
      setTimeout(animateArrival, 400);
    }

    target.addEventListener('animationend', () => {
      target.classList.remove('section-arrival');
    }, { once: true });
  });

  /* ----------------------------------------------------------------------------
   * 2. DYNAMIC CONTENT INJECTION (JS -> HTML)
   * Injects the current year into the footer copyright text
   * ---------------------------------------------------------------------------- */
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }


  /* ----------------------------------------------------------------------------
   * 3. THEME TOGGLE (LIGHT / DARK MODE)
   * Toggles .dark-mode on <body> and saves the state in localStorage
   * ---------------------------------------------------------------------------- */
  const updateThemeUI = (isDark) => {
    if (!themeBtn) return;
    const icon = themeBtn.querySelector('.theme-icon');
    const label = themeBtn.querySelector('.theme-label');

    if (isDark) {
      if (icon) icon.innerHTML = '&#9788;'; // Sun icon
      if (label) label.textContent = 'Light Mode';
      themeBtn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      if (icon) icon.innerHTML = '&#9790;'; // Moon icon
      if (label) label.textContent = 'Dark Mode';
      themeBtn.setAttribute('aria-label', 'Switch to dark mode');
    }
  };

  // Restore saved theme preference
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    updateThemeUI(true);
  } else {
    document.body.classList.remove('dark-mode');
    updateThemeUI(false);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
      updateThemeUI(isDark);
    });
  }


  /* ----------------------------------------------------------------------------
   * 4. MODERN BUBBLE ALERT NOTIFICATION
   * Replaces the browser's default window.alert() with a smooth UI bubble alert!
   * ---------------------------------------------------------------------------- */
  const showBubbleAlert = (titleText, messageText) => {
    if (!bubbleAlert) return;

    // Optional dynamic text update if provided
    if (titleText) {
      const titleEl = bubbleAlert.querySelector('.bubble-title');
      if (titleEl) titleEl.textContent = titleText;
    }
    if (messageText) {
      const msgEl = bubbleAlert.querySelector('.bubble-message');
      if (msgEl) msgEl.textContent = messageText;
    }

    // Reset any existing timeout
    if (bubbleTimer) {
      clearTimeout(bubbleTimer);
    }

    // Show the notification bubble
    bubbleAlert.classList.add('show');
    bubbleAlert.setAttribute('aria-hidden', 'false');

    // Auto-hide the bubble after 5 seconds
    bubbleTimer = setTimeout(() => {
      hideBubbleAlert();
    }, 5000);
  };

  const hideBubbleAlert = () => {
    if (!bubbleAlert) return;
    bubbleAlert.classList.remove('show');
    bubbleAlert.setAttribute('aria-hidden', 'true');
    if (bubbleTimer) {
      clearTimeout(bubbleTimer);
      bubbleTimer = null;
    }
  };

  // Attach click listener to the Hero Contact button
  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      showBubbleAlert(
        'Thank you for reaching out!',
        'You can email me directly at mark.lampano@student.example.com — Contact form coming soon!'
      );
    });
  }

  // Attach click listener to the Contact section action button
  if (contactActionBtn) {
    contactActionBtn.addEventListener('click', () => {
      showBubbleAlert(
        'Thank you for reaching out!',
        'You can email me directly at mlampano_260000000974@uic.edu.ph — Contact form coming soon!'
      );
    });
  }

  // Close bubble button listener
  if (bubbleCloseBtn) {
    bubbleCloseBtn.addEventListener('click', () => {
      hideBubbleAlert();
    });
  }


  /* ----------------------------------------------------------------------------
   * 5. RESPONSIVE MOBILE NAVIGATION TOGGLE
   * ---------------------------------------------------------------------------- */
  if (menuToggle && navContainer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navContainer.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu when clicking on any navigation link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navContainer.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Close modal/menu/bubble on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideBubbleAlert();
      if (navContainer && navContainer.classList.contains('open')) {
        navContainer.classList.remove('open');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });


  /* ----------------------------------------------------------------------------
   * 6. ACTIVE NAVIGATION LINK ON SCROLL (SCROLL SPY)
   * ---------------------------------------------------------------------------- */
  window.addEventListener('scroll', () => {
    let currentSection = '';
    const scrollPosition = window.pageYOffset + 120;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

});
