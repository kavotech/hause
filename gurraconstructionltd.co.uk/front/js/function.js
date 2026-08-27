(function ($) {
    "use strict";
	
	var $window = $(window); 
	var $body = $('body'); 

	/* Preloader Effect */
	$window.on('load', function(){
		$(".preloader").fadeOut(600);
	});

	/* Recalculate scroll-triggered animation positions once images and
	   webfonts have finished loading, since layout can shift after the
	   initial ScrollTrigger measurement and leave text stuck invisible. */
	if (typeof ScrollTrigger !== 'undefined') {
		$window.on('load', function() {
			ScrollTrigger.refresh();
		});
		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(function() {
				ScrollTrigger.refresh();
			});
		}
	}
	
	/* Sticky Header */	
	if($('.active-sticky-header').length){
		$window.on('resize', function(){
			setHeaderHeight();
		});

		function setHeaderHeight(){
	 		$("header.main-header").css("height", $('header .header-sticky').outerHeight());
		}	
	
		$(window).on("scroll", function() {
			var fromTop = $(window).scrollTop();
			setHeaderHeight();
			var headerHeight = $('header .header-sticky').outerHeight()
			// $("header .header-sticky").toggleClass("hide", (fromTop > headerHeight + 100));
			$("header .header-sticky").toggleClass("active", (fromTop > 300));
		});
	}	
	
	/* Slick Menu JS */
	$('#menu').slicknav({
		label : '',
		prependTo : '.responsive-menu',
		closeOnClick : true,
		duration : 300
	});

	/* Mobile drawer menu */
	if (!$('.mobile-drawer-brand').length) {
		$('.responsive-menu').prepend(
			'<div class="mobile-drawer-brand">' +
				'<a href="/"><img src="/logo.png" alt="Hausworks"></a>' +
				'<button class="mobile-drawer-close" type="button" aria-label="Close menu">&times;</button>' +
			'</div>'
		);
	}

	if (!$('.mobile-menu-overlay').length) {
		$('body').append('<div class="mobile-menu-overlay" aria-hidden="true"></div>');
	}

	function setMobileDrawerState(isOpen) {
		$('body').toggleClass('mobile-menu-open', isOpen);
		$('.slicknav_btn').attr('aria-expanded', isOpen ? 'true' : 'false');
		$('.mobile-menu-overlay').attr('aria-hidden', isOpen ? 'false' : 'true');
	}

	function closeMobileDrawer() {
		var $button = $('.slicknav_btn');
		if ($button.hasClass('slicknav_open')) {
			$button.trigger('click');
		} else {
			setMobileDrawerState(false);
		}
	}

	$(document).on('click', '.slicknav_btn', function() {
		setMobileDrawerState($(this).hasClass('slicknav_open'));
	});

	$(document).on('click', '.mobile-menu-overlay, .mobile-drawer-close, .slicknav_nav a', function() {
		closeMobileDrawer();
	});

	$(document).on('keydown', function(event) {
		if (event.key === 'Escape' && $('body').hasClass('mobile-menu-open')) {
			closeMobileDrawer();
			$('.slicknav_btn').trigger('focus');
		}
	});

	$window.on('resize', function() {
		if ($window.width() >= 992 && $('body').hasClass('mobile-menu-open')) {
			closeMobileDrawer();
		}
	});

	$('.slicknav_btn')
		.attr('aria-label', 'Open navigation menu')
		.attr('aria-expanded', 'false');

	var currentUrlPath = window.location.pathname.toLowerCase();
	var currentPath = currentUrlPath.split('/').pop() || 'index.html';
	if (currentUrlPath.indexOf('/service/') !== -1) {
		currentPath = 'our-services.html';
	} else if (currentUrlPath.indexOf('/project/') !== -1) {
		currentPath = 'projects.html';
	}
	$('.main-menu a, .slicknav_nav a').each(function() {
		var linkPath = ($(this).attr('href') || '').split('/').pop();
		if (linkPath === currentPath) {
			$(this).addClass('active-menu-link');
		}
	});

	/* The official reCAPTCHA script supplies its own standard badge. */
	$('.recaptcha-v3-sign').remove();

	function refreshRecaptchaToken() {
		var $contactForm = $('#contactForm');
		var siteKey = $contactForm.data('recaptcha-site-key') || '6LfGe5ktAAAAAA7zTcVjwBjLtSTsicFOjgIvsFua';

		if (!siteKey || typeof grecaptcha === 'undefined') {
			return;
		}

		grecaptcha.ready(function() {
			grecaptcha.execute(siteKey, { action: $contactForm.length ? 'contact' : 'page_view' }).then(function(token) {
				if ($('#recaptchaToken').length) {
					$('#recaptchaToken').val(token);
				}
			});
		});
	}

	refreshRecaptchaToken();
	$('#contactForm').on('focusin', function() {
		if (!$('#recaptchaToken').val()) {
			refreshRecaptchaToken();
		}
	});

	/* Cookie preferences */
	var cookieChoice = localStorage.getItem('hausworksCookieConsent');
	var cookiePrefs = localStorage.getItem('hausworksCookiePreferences');

	if (!cookieChoice && !$('.cookie-consent-panel').length) {
		$('body').append(
			'<div class="cookie-consent-panel" role="dialog" aria-modal="true" aria-labelledby="cookieTitle">' +
				'<button class="cookie-close" type="button" aria-label="Close cookie settings">&times;</button>' +
				'<h2 id="cookieTitle">We use<br><span>cookies</span></h2>' +
				'<p>We use cookies to keep the site working, understand visits and improve your browsing experience.</p>' +
				'<div class="cookie-options" aria-label="Cookie preferences">' +
					'<label class="cookie-option is-required"><input type="checkbox" checked disabled><span><strong>Necessary</strong><small>Required for the website to work.</small></span></label>' +
					'<label class="cookie-option"><input type="checkbox" name="analytics"><span><strong>Analytics</strong><small>Helps us understand how visitors use the site.</small></span></label>' +
					'<label class="cookie-option"><input type="checkbox" name="marketing"><span><strong>Marketing</strong><small>Helps measure enquiries and campaigns.</small></span></label>' +
				'</div>' +
				'<div class="cookie-actions">' +
					'<button class="cookie-accept" type="button">Accept</button>' +
					'<button class="cookie-save" type="button">Cookie Policies</button>' +
				'</div>' +
			'</div>'
		);
	} else if (cookiePrefs) {
		$('body').addClass('cookie-preferences-loaded');
	}

	function saveCookiePreferences(acceptAll) {
		var preferences = {
			necessary: true,
			analytics: acceptAll || $('.cookie-option input[name="analytics"]').is(':checked'),
			marketing: acceptAll || $('.cookie-option input[name="marketing"]').is(':checked')
		};

		localStorage.setItem('hausworksCookieConsent', 'saved');
		localStorage.setItem('hausworksCookiePreferences', JSON.stringify(preferences));
		$('.cookie-consent-panel').addClass('is-hiding');
		setTimeout(function() {
			$('.cookie-consent-panel').remove();
		}, 280);
	}

	$(document).on('click', '.cookie-accept', function() {
		saveCookiePreferences(true);
	});

	$(document).on('click', '.cookie-save, .cookie-close', function() {
		saveCookiePreferences(false);
	});

	if($("a[href='#top']").length){
		$("a[href='#top']").click(function() {
			$("html, body").animate({ scrollTop: 0 }, "slow");
			return false;
		});
	}

	/* Hero Slider Layout JS */
	const hero_slider_layout = new Swiper('.hero-slider-layout .swiper', {
		slidesPerView : 1,
		speed: 1000,
		spaceBetween: 0,
		loop: true,
		autoplay: {
			delay: 4000,
		},
		pagination: {
			el: '.hero-pagination',
			clickable: true,
		},
	});

	/* testimonial Slider JS */
	if ($('.testimonial-slider').length) {
		const testimonial_slider = new Swiper('.testimonial-slider .swiper', {
			slidesPerView : 1,
			speed: 1000,
			spaceBetween: 30,
			loop: true,
			autoplay: {
				delay: 5000,
			},
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
			navigation: {
				nextEl: '.testimonial-button-next',
				prevEl: '.testimonial-button-prev',
			},
			breakpoints: {
				768:{
				  	slidesPerView: 1,
				},
				991:{
				  	slidesPerView: 1,
				}
			}
		});
	}

	if ($('.service-single-slider').length) {
		const testimonial_slider = new Swiper('.service-single-slider .swiper', {
			slidesPerView : 1,
			speed: 1000,
			spaceBetween: 30,
			loop: true,
			autoplay: {
				delay: 5000,
			},
			pagination: {
				el: '.service-pagination',
				clickable: true,
			},
			breakpoints: {
				768:{
				  	slidesPerView: 1,
				},
				991:{
				  	slidesPerView: 1,
				}
			}
		});
	}

	/* Skill Bar */
	if ($('.skills-progress-bar').length) {
		$('.skills-progress-bar').waypoint(function() {
			$('.skillbar').each(function() {
				$(this).find('.count-bar').animate({
				width:$(this).attr('data-percent')
				},2000);
			});
		},{
			offset: '50%'
		});
	}

	/* Youtube Background Video JS */
	if ($('#herovideo').length) {
		var myPlayer = $("#herovideo").YTPlayer();
	}

	/* Init Counter */
	if ($('.counter').length) {
		$('.counter').counterUp({ delay: 4, time: 3000 });
	}

	/* Image Reveal Animation */
	if ($('.reveal').length) {
        gsap.registerPlugin(ScrollTrigger);
        let revealContainers = document.querySelectorAll(".reveal");
        revealContainers.forEach((container) => {
            let image = container.querySelector("img");
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    toggleActions: "play none none none"
                }
            });
            tl.set(container, {
                autoAlpha: 1
            });
            tl.from(container, 1, {
                xPercent: -100,
                ease: Power2.out
            });
            tl.from(image, 1, {
                xPercent: 100,
                scale: 1,
                delay: -1,
                ease: Power2.out
            });
        });
    }

	/* Text Effect Animation */
	if ($('.text-anime-style-1').length) {
		let staggerAmount 	= 0.05,
			translateXValue = 0,
			delayValue 		= 0.5,
		   animatedTextElements = document.querySelectorAll('.text-anime-style-1');
		
		animatedTextElements.forEach((element) => {
			let animationSplitText = new SplitText(element, { type: "chars, words" });
				gsap.from(animationSplitText.words, {
				duration: 1,
				delay: delayValue,
				x: 20,
				autoAlpha: 0,
				stagger: staggerAmount,
				scrollTrigger: { trigger: element, start: "top 85%" },
				});
		});		
	}
	
	if ($('.text-anime-style-2').length) {				
		let	 staggerAmount 		= 0.03,
			 translateXValue	= 20,
			 delayValue 		= 0.1,
			 easeType 			= "power2.out",
			 animatedTextElements = document.querySelectorAll('.text-anime-style-2');
		
		animatedTextElements.forEach((element) => {
			let animationSplitText = new SplitText(element, { type: "chars, words" });
				gsap.from(animationSplitText.chars, {
					duration: 1,
					delay: delayValue,
					x: translateXValue,
					autoAlpha: 0,
					stagger: staggerAmount,
					ease: easeType,
					scrollTrigger: { trigger: element, start: "top 85%"},
				});
		});		
	}
	
	function initTextAnimeStyle3() {
		if (!$('.text-anime-style-3').length) {
			return;
		}
		let animatedTextElements = document.querySelectorAll('.text-anime-style-3');

		animatedTextElements.forEach((element) => {
			// Reset if needed (also re-run on resize so lines re-wrap for the
			// current viewport instead of keeping stale line breaks from the
			// width the text was originally split at — a common cause of
			// broken-looking headings after a mobile orientation change).
			if (element.animation) {
				element.animation.progress(1).kill();
				element.split.revert();
			}

			element.split = new SplitText(element, {
				type: "lines,words,chars",
				linesClass: "split-line",
			});
			gsap.set(element, { perspective: 400 });

			gsap.set(element.split.chars, {
				opacity: 0,
				y: "60",
				x: "0",
				rotateX: "-90",
			});

			element.animation = gsap.to(element.split.chars, {
				scrollTrigger: { trigger: element,	start: "top 95%" },
				x: "0",
				y: "0",
				rotateX: "0",
				opacity: 1,
				duration: 1.1,
				ease: Back.easeOut.config(1.6),
				stagger: 0.025,
			});
		});
	}

	initTextAnimeStyle3();

	var textAnimeResizeTimer;
	$window.on('resize', function() {
		clearTimeout(textAnimeResizeTimer);
		textAnimeResizeTimer = setTimeout(initTextAnimeStyle3, 250);
	});

	/* Parallaxie js */
	var $parallaxie = $('.parallaxie');
	if($parallaxie.length && ($window.width() > 991))
	{
		if ($window.width() > 768) {
			$parallaxie.parallaxie({
				speed: 0.55,
				offset: 0,
			});
		}
	}

	/* Animated Wow Js */	
	new WOW().init();

	/* Popup Video */
	if ($('.popup-video').length) {
		$('.popup-video').magnificPopup({
			type: 'iframe',
			mainClass: 'mfp-fade',
			removalDelay: 160,
			preloader: false,
			fixedContentPos: true
		});
	}
		
})(jQuery);
