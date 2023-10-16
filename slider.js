import {leffArrowSvg, rightArrowSvg} from './slider-svg.js';


class Slider {

    /**
     * The constuctor of the slider objects.
     * 
     * @param {HTMLElement} element The HTML element which will be the slider 
     * @param {object} options The differents options of the slider
     * @param {number} options.slideToScroll Number of slide to scroll per scrolling
     * @param {number} options.slideToShow Number of slide to show
     * @param {boolean} options.endPlaceholder If a placeholder should be show at end
     * @param {boolean} options.rtl If the right to left direction is active
     * @param {object} options.overflow The overflow effect
     * @param {boolean} options.overflow.active Show overflow or not
     * @param {string} options.overflow.size The width of the next slide to show
     * @param {boolean} options.loop If should restart slide on end or go to end on start
     * @param {boolean} options.infiniteSlide Show infinite slide or not
     * @param {boolean} options.adaptiveWidth If the width of each slide should be recalculate to keep in the slider
     * @param {object} options.autoPlay The auto play option
     * @param {boolean} options.autoPlay.active If the slider while scroll automatically
     * @param {number} options.autoPlay.delay The delay of the auto play on ms
     * @param {boolean} option.autoPlay.pauseOnInteraction If auto play shoud be stoped on interaction
     * @param {object} options.navigation The navigation options
     * @param {boolean} options.navigation.active If the navigation should be showed
     * @param {string} options.navigation.arrow The style of arrow to show
     * @param {string} options.navigation.position The position of the navigation arrow(top or bottom)
     * @param {object} options.pagination The pagination options
     * @param {boolean} options.pagination.active If the pagination should be showed
     * @param {boolean} options.pagination.forEachSlide If the one pagination per slide or one pagination per view
     */
    constructor (element, options) {

        //set the default options
        this.defaultOptions = Object.assign({}, {
            slideToShow: 3,
            slideToScroll: 1,
            rtl: false,
            overflow: {
                active: false,
                size: '5%'
            },
            responsive: [
                {

                },
            ],
            loop: true,
            infiniteSlide: true,
            adaptiveWidth: true,
            autoPlay: {
                active: false,
                delay: 5000,
                pauseOnInteraction: true
            },
            navigation: {
                active: true,
                arrow: 'head',
                position: 'middle'
            },
            pagination: {
                forEachSlide: false,
                active: true,
            }
        }, options);

        //Initializing the object proprieties

        //The current options
        this.currentOptions = {};
        // The element which will be transform to a slider
        this.element = element;
        //The slider container
        this.container = null;
        //Media queries list
        this.mediaQueryLists = [];
        //The wrapper of each slider item
        this.slides = [];
        //The length of the slides array
        this.size = 0;
        //The navigation option 
        this.navigation = null;
        //The navigation option 
        this.pagination = null;
        //The current slide
        this.currentSlide = 0;
        //The current last slide
        this.lastItem = 0;
        //The translate x width
        this.currentTranslateX = 0;
        //The initial value of translation(only if the rtl direction is set)
        this.rtlInitTranslateX = 0;
        //offset of the slide
        this.slideOffsets = [];
        
        this.setOptions()

        this.element.addEventListener('keydown', this.onKeydown.bind(this));
        window.addEventListener('resize', this.onResize.bind(this));
    }


    /**
     * Set the slider options
     * 
     * @param {object} options the new options to set.
     */
    setOptions(options = this.defaultOptions) {

        this.currentOptions = Object.assign({}, options)

        this.createContainer();

        if (this.pagination === null)
            this.createPagination();

        if (this.navigation === null)
            this.createNavigation();

        //Init the items list when infinite slide's option is activate
        if (this.currentOptions.infiniteSlide)
            this.setInfiniteSlide();

        if (this.currentOptions.autoPlay.active)
            setInterval(() => rtl ? this.toLeft() : this.toRight(), this.currentOptions.autoPlay.delay);

        this.initSliderPosition();
    }

    /***************** Creation of the slider parts's functions *****************/

    /**
     * Create a html element with the class set in argument.
     * 
     * @param {string} element 
     * @param {string} classNames 
     * @return HTMLElement
     */
    createElementWithClass(element, classNames) {
        let elt = document.createElement(element);
        elt.setAttribute('class', classNames);

        return elt;
    }


    /**
     * Create a container for the slider
     *
     */
    createContainer() {
    
        //The width of each item
        let itemWidth = this.currentOptions.adaptiveWidth ? (100 / this.element.children.length) + '%' : 'auto';
        
        if (this.container === null) {

            this.container = this.createElementWithClass('div', 'slider__container');

            //Creation of slide wrapper and adding to the slider container
            Array.from(this.element.children).forEach(child => {

                    let elt = this.createElementWithClass('div', 'slider__item');
                    elt.style.width = itemWidth;
                    elt.setAttribute('aria-hidden', 'true')
                    elt.appendChild(child);
                    this.container.appendChild(elt);
                    this.slides.push(elt);
                    this.size++;
                }
            );
            this.slides[this.currentSlide].setAttribute('aria-hidden', 'false');

            this.element.appendChild(this.container);
        }

        this.container.style.width = this.currentOptions.adaptiveWidth ? ((100 / this.currentOptions.slideToShow) * this.size) + '%' : 'max-content';
        if (this.currentOptions.rtl) this.container.style.direction = 'rtl';

        this.element.style.width = this.currentOptions.overflow.active ? `calc(100% - ${this.currentOptions.overflow.size})` : '100%';
        
        this.container.style.transition = "transform 0.2s ease-out";
    }


    /**
     * Create the navigation of the slider.
     * 
     * @description Verify if the navigation option is activate or not. If it
     * is activate, it create a container for the navigation and add the
     * navigation button to this container.
     */
    createNavigation() {

        if (this.slides.length > this.currentOptions.slideToShow || this.currentOptions.infiniteSlide) {

            let navHeight = '20px';
            //The html container for the navigation
            this.navigation = this.createElementWithClass('div', 'slider__navigation');
            this.navigation.style.height = navHeight;

            //The toLeftious button
            let toLeftButton = this.createElementWithClass('div', 'slider__navigation__toLeft');
            let toleftIcon = this.createElementWithClass('span', 'slider__navigation__toLeft-icon');
            let toLeftLabel = this.createElementWithClass('p', 'slider__navigation__toLeft-label ssl-sr-only');

            toleftIcon.setAttribute('aria-hidden', 'true');
            toleftIcon.innerHTML = leffArrowSvg;
            toLeftLabel.textContent = this.currentOptions.rtl ? 'Next' : 'Previous';
    
            toLeftButton.appendChild(toleftIcon);
            toLeftButton.appendChild(toLeftLabel);
            toLeftButton.setAttribute('role', 'button');
            toLeftButton.addEventListener('click', this.toLeft.bind(this));

            //The toRight button
            let toRightButton = this.createElementWithClass('div', 'slider__navigation__toRight');
            let toRightIcon = this.createElementWithClass('span', 'slider__navigation__toRight-icon');
            let toRightLabel = this.createElementWithClass('div', 'slider__navigation__toRight-label ssl-sr-only');
            
            toRightIcon.innerHTML = rightArrowSvg;
            toRightIcon.setAttribute('aria-hidden', 'true');
            toRightLabel.textContent = this.currentOptions.rtl ? 'Previous' : 'Next';

            toRightButton.appendChild(toRightIcon);
            toRightButton.appendChild(toRightLabel);
            toRightButton.setAttribute('role', 'button')
            toRightButton.addEventListener('click', this.toRight.bind(this));

            this.navigation.appendChild(toLeftButton);
            this.navigation.appendChild(toRightButton);

            if (this.currentOptions.navigation.active) {

                if(this.currentOptions.navigation.position === 'top') {
                    this.element.insertAdjacentElement('afterbegin', this.navigation);
                } else if (this.currentOptions.navigation.position === 'bottom') {
                    this.element.insertAdjacentElement('beforeend', this.navigation);
                } else {
                    this.element.style.position = 'relative';
                    this.navigation.style.position = 'absolute';
                    this.navigation.style.top = '50%';
                    this.navigation.style.transform = "translateY(calc(-50% - " + navHeight + '))';
                    this.element.appendChild(this.navigation);
                }
            }

            this.updateNavigation();
        }
    }


    /**
     * Create and init the pagination of the slider.
     * 
     * @description verify if the pagination option is activate or not. If it
     * is activate, it create a container for the pagination and add the
     * navigation button to this container.
     */
    createPagination() {

        if (this.currentOptions.pagination.active) {

            let n = this.currentOptions.pagination.forEachSlide ? this.slides.length :
                Math.ceil(this.slides.length / this.currentOptions.slideToShow);

            //The html container for the navigation
            this.pagination = this.createElementWithClass('div', 'slider__pagination');

            //The pagination button
            for (let i = 0; i < n; i++) {

                let button = this.createElementWithClass('div', 'slider__pagination__button');
                if(i == 0) button.classList.add('is_active');

                button.addEventListener('click', this.paginationClick.bind(this));
                this.pagination.appendChild(button);
            }

            this.element.insertAdjacentElement('beforeend', this.pagination);
        }
    }


    /**
     * init the current slide position
     */
    initSliderPosition() {

        if (this.currentOptions.rtl) {

            for (let i in this.slides) {

                if (i + this.currentOptions.slideToShow < this.size)
                    this.rtlInitTranslateX -= this.slides[i].offsetWidth;
            }
            this.currentTranslateX = this.rtlInitTranslateX;
        }

        if (this.currentOptions.infiniteSlide) this.currentSlide += this.slideOffsets[0];

        this.scroll(false);
    }


    /**
     * set up the infinite slide options
     */
    setInfiniteSlide() {

        let bwOffset = this.currentOptions.slideToShow; //Foreward offset
        let bwItems = [];

        for (let i = 0, j = this.size - 1; i < bwOffset; i++, j--) {

            j = j < 0 ? this.size - 1 : j;

            let clone = this.slides[j].cloneNode(true);
            bwItems.push(clone);
            this.container.insertAdjacentElement('afterbegin', clone);
        }
        
        let fwOffset = this.size % this.currentOptions.slideToShow; //Backward offset
        let fwItems = [];

        fwOffset = fwOffset ? this.currentOptions.slideToShow - fwOffset + 1: 0

        for (let i = 0, j = 0; i < fwOffset; i++, j++) {

            j = j == this.size ? 0 : j;

            let clone = this.slides[j].cloneNode(true);
            fwItems.push(clone);
            this.container.appendChild(clone);
        }

        this.slides = [
            ...bwItems,
            ...this.slides,
            ...fwItems
        ];

        this.slideOffsets = [bwOffset, fwOffset];
        this.size += bwOffset + fwOffset;
    }


    createMediaQueries() {

        this.currentOptions.responsive.forEach( responsive => {
            let mediaQueryList = window.matchMedia(`max-width: ${responsive.breakpoint}`);

            mediaQueryList.addEventListener('change', this.onMediaQueryChange.bind(this));

            this.mediaQueryLists.push(mediaQueryList);
        })
    }

    /*********************** Slider update functions ***********************/

    /**
     * Update the navigation by displaying or hide the buttons.
     */
    updateNavigation() {

        if (this.currentOptions.infiniteSlide)
            return;

        if (this.currentSlide === this.slides.length - 1 && !this.currentOptions.loop)
            this.navigation.children[1].style.display = 'none';
        
        else
            if(this.navigation.children[1].style.display = 'none')
                this.navigation.children[1].style.display = 'block';

        if (this.currentSlide === 0 && !this.currentOptions.loop)
            this.navigation.children[0].style.display = 'none';
        else
            if(this.navigation.children[0].style.display = 'none')
                this.navigation.children[0].style.display = 'block';
    }

    
    /**
     * Update the pagination when user navigate.
     */
    updatePagination() {

        Array.from(this.pagination.children).forEach( child => child.classList.remove('is_active') );

        let i = 0;
        
        if (this.currentOptions.infiniteSlide) {

            if (this.currentOptions.pagination.forEachSlide) {

                if (this.currentSlide < this.slideOffsets[0])
                    i = this.pagination.children.length - 1;
                else if (this.currentSlide >= this.size - this.slideOffsets[1])
                    i = 0;
                else
                    i = this.currentSlide - this.slideOffsets;
            } else {

                if (this.currentSlide < this.slideOffsets[0])
                    i = ceil((this.size - this.slideOffsets[1] - this.slideOffsets[0] + this.currentSlide - 1) /
                    this.currentOptions.slideToShow);
                else if (this.currentSlide >= this.size - this.slideOffsets[1])
                    i = this.size - this.currentSlide - this.slideOffsets[1];
                else
                    i = ceil((this.currentSlide - this.slideOffsets[0]) / this.currentOptions.slideToShow);
            }
        } else
            i = this.currentOptions.pagination.forEachSlide ?
                this.currentSlide : ceil(this.currentSlide / this.currentOptions.slideToShow);

        this.pagination.children[i].classList.add('is_active');
    }


    /**
     * This function scroll the slider by translate the container.
     * 
     * @param {boolean} withTransition Determine if an animation will be applied to the scroll
     */
    scroll(withTransition = true) {

        let temp = this.container.style.transition;

        this.slides[this.lastItem].setAttribute('aria-hidden', 'true');
        this.slides[this.currentSlide].setAttribute('aria-hidden', 'false');

        if (!withTransition) {

            temp = this.container.style.transition;
            this.container.style.transition = "none";
        }
// debugger
        if (this.currentSlide === 0)
            this.currentTranslateX = (this.currentOptions.rtl) ? this.rtlInitTranslateX : 0;
        
        else {

            if (this.lastItem < this.currentSlide)
                //Compute the sum of the width beetween the last slide and the current slide
                for (let i = this.lastItem; i < this.currentSlide; i++)
                    this.currentTranslateX += (this.currentOptions.rtl) ? this.slides[i].offsetWidth : -this.slides[i].offsetWidth;
            
            else
                //Cf last comment
                for (let i = this.lastItem; i > this.currentSlide; i--)
                    this.currentTranslateX += (this.currentOptions.rtl) ? -this.slides[i].offsetWidth : this.slides[i].offsetWidth;
        }

        this.container.style.transform = `translateX(${this.currentTranslateX}px)`;
        
        //Forcing redrawing the DOM else the transition value will be the last value assigned
        //so, event if we don't want transition, the transition will be applied because the last value
        //will be temp which contains the transition value saved.
        if (!withTransition)
            this.container.offsetHeight;//Forcing redraw by request height for example.
        
        if (!withTransition) {
            this.container.style.transition = temp;
        }

        this.updateNavigation();
        this.updatePagination();
    }


    /**
     * Go to the next slide value.
     * 
     * @description Update the current slide value by calculate and set the new value of the
     * current item.
     * 
     * @returns {boolean} true if a new value were set and false else.
     */
    gotoNextSlide() {

        let setSlide = false;

        if (this.currentOptions.infiniteSlide) {

            let offset = this.currentSlide + this.currentOptions.slideToScroll + this.currentOptions.slideToShow - this.size;

            this.lastItem = this.currentSlide;

            if (offset > 0) {

                this.currentSlide = this.slideOffsets[0] + (this.currentOptions.slideToScroll - abs(offset));
                this.scroll(false);
                this.lastItem = this.currentSlide;
                this.currentSlide += abs(offset);
            } else {
                this.currentSlide += this.currentOptions.slideToScroll
            }

            setSlide = true;
        } else {

            if(this.currentSlide + this.currentOptions.slideToScroll < this.slides.length) {

                setSlide = true;
                this.lastItem = this.currentSlide;
                this.currentSlide += this.currentOptions.slideToScroll;

            } else if(this.currentSlide + this.currentOptions.slideToScroll >= this.slides.length && this.currentOptions.loop) {

                setSlide = true;
                this.lastItem = this.currentSlide;
                this.currentSlide = 0;
            }
        }

        return setSlide;
    }


    /**
     * Go to the previous slide value.
     * 
     * @description Update the current slide value by calculate and set the new value of the
     * current item.
     * 
     * @returns {boolean} true if a new value were set and false else.
     */
    gotoPreviousSlide() {

        let setSlide = false;

        if (this.currentOptions.infiniteSlide) {

            let offset = this.currentSlide - this.currentOptions.slideToScroll
            
            this.lastItem = this.currentSlide;

            if (offset < 0) {
                this.currentSlide += this.size - this.slideOffsets[1] - this.slideOffsets[0];
                this.scroll(false);
                this.lastItem = this.currentSlide;
                this.currentSlide -= abs(offset);
            } else {
                this.currentSlide -= this.currentOptions.slideToScroll
            }

            setSlide = true;
        } else {

            if(this.currentSlide - this.currentOptions.slideToScroll >= 0) {

                setSlide = true;
                this.lastItem = this.currentSlide;
                this.currentSlide -= this.currentOptions.slideToScroll;

            } else if(this.currentSlide - this.currentOptions.slideToScroll < 0 && this.currentOptions.loop) {

                setSlide = true;
                this.lastItem = this.currentSlide;
                this.currentSlide = this.slides.length - 1;
            }
        }

        return setSlide;
    }


    /**************************** Callback functions **************************/

    /**
     * Callback function called when "click" event occurs on the right
     * navigation button.
     * 
     * @description This function go to previous slides if rtl is active or go
     * next slides else.
     */
    toRight() {

        let setSlide = false;

        if (this.currentOptions.rtl)
            setSlide = this.gotoPreviousSlide();

        else
            setSlide = this.gotoNextSlide();

        if (setSlide)
            this.scroll();
    }


    /**
     * Callback function called when "click" event occurs on the left
     * navigation button.
     * 
     * @description: This function go to next slides if rtl is active or go
     * next slides else.
     */
    toLeft() {

        let setSlide = false;

        if (this.currentOptions.rtl)
            setSlide = this.gotoNextSlide();

        else
            setSlide = this.gotoPreviousSlide();

        if (setSlide)
            this.scroll();
    }


    /**
     * Callback function called when "click" event occurs on the pagination
     * buttons.
     * 
     * @description This function go to next slides if rtl is active or go
     * next slides else.
     */
    paginationClick(event) {

        let i = Array.from(this.pagination.children).indexOf(event.target);

        let j = this.currentOptions.pagination.forEachSlide ? i : i * this.currentOptions.slideToShow;

        if (j >= this.slides.length)
            j = this.slides.length - 1;

        if (j != this.currentSlide) {

            Array.from(this.pagination.children).forEach( child => child.classList.remove('is_active') );

            this.lastItem = this.currentSlide;

            this.currentSlide = j;
            console.log(this.currentSlide)
            event.target.classList.toggle('is_active');
            this.scroll();
        }
    }


    /**
     * Callback function to the window resize event.
     * 
     * @description This function update the slider settings to the currents callback
     * according the responsive object in the slider options.
     */
    onResize(event) {

        // this.currentOptions.responsive.forEach(responsive => {
                
        //     if (window.innerWidth <= responsive.breakpoint)
        //         this.resetOptions(responsive.options);

        //     else 
        //         this.resetOptions(this.currentOptions);

        // });
    }


    /**
     * Callback function to the "keydown" event.
     * 
     * @description This function update the slider settings to the currents callback
     * according the responsive object in the slider options.
     */
    onKeydown(event) {

        if (event.code == "ArrowLeft") {
            this.toLeft();
        } else if (event.code == "ArrowRight") {
            this.toRight();
        }
    }


    onMediaQueryChange(mql) {

        // if (mql.matches) {

        //     this.resetOptions(this.)
        // }
        
    }
}

/**
 * Compute the absolute value of a number.
 * 
 * @param {number} x The number which absolute value to compute.
 * @returns The absolute value of x
 */
function abs (x) {
    return (x < 0) ? -x : x;
}


/**
 * Get the integer which is immediatly lower than x if x is decimal or
 * the number itself if it is an integer.
 * 
 * @param {number} x
 * @returns The integer greater than x or x itself.
 */
function ceil (x) {
    return parseInt(x);
}


document.addEventListener('DOMContentLoaded', function() {

    const sliders = document.getElementsByClassName('slider');

    for(let slider of sliders) {
        let x = new Slider(slider, {});
    }
});