
class Slider {

    /**
     * @param {HTMLElement} element The HTML element which will be the slider 
     * @param {object} options The differents options of the slider
     * @param {number} options.slideToShow Number of slide to scroll per scroll
     * @param {number} options.slideToShow Number of slide to show
     * @param {object} options.autoPlay The auto play option
     * @param {boolean} options.autoPlay.active 
     * @param {boolean} options.autoPlay.delay 
     * @param {object} options.navigation The navigation option
     * @param {boolean} options.navigation.active If the navigation should be showed
     * @param {string} options.navigation.arrow A boolean that represent if the navigation arrow should be shown
     * @param {string} options.navigation.radio A boolean that represent if the navigation radio should be shown
     * @param {string} options.navigation.arrowPosition The position of the navigation arrow(top or bottom)
     * @param {string} options.navigation.radioPosition The position of the navigation radio(top or bottom)
     * 
     */
    constructor (element, options) {

        this.options = Object.assign({}, {
            slideToShow: 3,
            slideToScroll: 1,
            endPlaceholder: true,//
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
                delay: 5000
            },
            navigation: {
                active: true,
                arrow: 'head',
                position: 'top'
            },
            pagination: {
                forEachSlide: false,
                active: true,
            }
        }, options);

        //Initializing the object proprieties

        // The element which will be transform to a slider
        this.element = element;
        //The slider container
        this.container = null;
        //The wrapper of each slider item
        this.itemWrappers = [];
        //The navigation option 
        this.navigation = null;
        //The navigation option 
        this.pagination = null;
        //The current slide
        this.currentItem = 0;
        //The current last slide
        this.lastItem = null;
        //The translate x width
        this.currentTranslateX = 0;
        //The initial value of translation(only if the rtl direction is set)
        if (this.options.rtl)
            this.rtlInitTranslateX = 0;
        
        //The number of item in the slider
        let itemLength = this.element.children.length;
        //The width of each item
        let itemWidth = this.options.adaptiveWidth ? (100 / itemLength) + '%' : 'auto';

        this.container = this.createElementWithClass('div', 'slider__container');
        this.container.style.width = this.options.adaptiveWidth ? ((100 / this.options.slideToShow) * itemLength) + '%' : 'max-content';
        this.element.appendChild(this.container);

        this.element.style.width = this.options.overflow.active ? `calc(100% - ${this.options.overflow.size})` : '100%';

        //Creation of slide item
        Array.from(this.element.children).forEach(child => {

            if (!child.classList.contains('slider__container')) {

                let elt = this.createElementWithClass('div', 'slider__item');
                elt.style.width = itemWidth;
                elt.setAttribute('aria-hidden', 'true')
                elt.appendChild(child);
                this.container.appendChild(elt);
                this.itemWrappers.push(elt); 
            }
        });
        this.itemWrappers[this.currentItem].setAttribute('aria-hidden', 'false');


        //Set slider direction
        if (this.options.rtl) {
                
            this.container.style.direction = 'rtl';

            this.currentTranslateX = this.itemWrappers.reduce((accumulateur, element, indice) => 
                accumulateur -= (indice + this.options.slideToShow < itemLength) ? element.offsetWidth : 0, 0);

            this.rtlInitTranslateX = this.currentTranslateX
    
            this.container.style.transform = `translateX(${this.currentTranslateX}px)`;
        }

        this.createPagination();

        this.createNavigation();

        if (this.options.autoPlay.active) {
            setInterval(() => rtl ? this.toLeft() : this.toRight(), this.options.autoPlay.delay);
        }

        window.addEventListener('resize', this.onResize.bind(this));
    }


    /***************** Creation of the slider parts functions *****************/

    /**
     * Create a html element with the class set in argument.
     * 
     * @param {string} element 
     * @param {string} className 
     * @return HTMLElement
     */
    createElementWithClass(element, className) {
        let elt = document.createElement(element);
        elt.setAttribute('class', className);

        return elt;
    }


    /**
     * Create the navigation of the slider.
     * 
     * description: verify if the navigation option is activate or not. If it
     * is activate, it create a container for the navigation and add the
     * navigation button to this container.
     */
    createNavigation() {

        if (this.itemWrappers.length > this.options.slideToShow && this.options.navigation.active) {

            //The html container for the navigation
            this.navigation = this.createElementWithClass('div', 'slider__navigation');

            //The toLeftious button
            let toLeftButton = this.createElementWithClass('div', 'slider__navigation__toLeft');
            toLeftButton.innerHTML = this.options.navigation.arrow == 'full' ? "&#129120;" :
                this.options.navigation.arrow == 'head' ? "&#10094;" : "&#129168;";
            toLeftButton.addEventListener('click', this.toLeft.bind(this));

            //The toRight button
            let toRightButton = this.createElementWithClass('div', 'slider__navigation__toRight');
            toRightButton.innerHTML = this.options.navigation.arrow == 'full' ? "&#129122" : 
                this.options.navigation.arrow == 'head' ? "&#10095;" : "&#129170;";
            toRightButton.addEventListener('click', this.toRight.bind(this));

            this.navigation.appendChild(toLeftButton);
            this.navigation.appendChild(toRightButton);

            if(this.options.navigation.position === 'top') {
                this.element.insertAdjacentElement('afterbegin', this.navigation);
            } else {
                this.element.insertAdjacentElement('beforeend', this.navigation);
            }

            this.updateNavigation();
        }
    }


    /**
     * Create and init the pagination of the slider.
     * 
     * description: verify if the pagination option is activate or not. If it
     * is activate, it create a container for the pagination and add the
     * navigation button to this container.
     */
    createPagination() {

        if (this.options.pagination.active) {

            let n = this.options.pagination.forEachSlide ? this.itemWrappers.length :
                Math.ceil(this.itemWrappers.length / this.options.slideToShow);

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


    /*********************** Slider update functions ***********************/

    /**
     * Update the navigation by displaying or hide the buttons.
     */
    updateNavigation() {

        if (this.currentItem === this.itemWrappers.length - 1 && !this.options.loop)
            this.navigation.children[1].style.display = 'none';
        
        else
            if(this.navigation.children[1].style.display = 'none')
                this.navigation.children[1].style.display = 'block';

        if (this.currentItem === 0 && !this.options.loop)
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

        let i = Math.ceil(this.currentItem / this.options.slideToShow);

        this.pagination.children[i].classList.add('is_active');
    }


    /**
     * This function slide the slider by translate the container.
     */
    slide() {

        this.itemWrappers[this.currentItem].setAttribute('aria-hidden', 'false');
        this.itemWrappers[this.lastItem].setAttribute('aria-hidden', 'true');

        if (this.currentItem === 0)
            this.currentTranslateX = (this.options.rtl) ? this.rtlInitTranslateX : 0;
        
        else {

            if (this.lastItem < this.currentItem)
                for (let i = this.lastItem; i < this.currentItem; i++)
                    this.currentTranslateX += (this.options.rtl) ? this.itemWrappers[i].offsetWidth : -this.itemWrappers[i].offsetWidth;
            
            else
                for (let i = this.lastItem; i > this.currentItem; i--)
                    this.currentTranslateX += (this.options.rtl) ? -this.itemWrappers[i].offsetWidth : this.itemWrappers[i].offsetWidth;
        }

        this.container.style.transform = `translateX(${this.currentTranslateX}px)`;

        this.updateNavigation();

        this.updatePagination();
    }


    /**
     * @description This function update the settings/options when new settings are set.
     * ie: when a new breakpoint is find after the window "resize" event.
     */
    resetOptions(newOptions) {

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

        if(this.currentItem + this.options.slideToScroll < this.itemWrappers.length) {

            setSlide = true;
            this.lastItem = this.currentItem;
            this.currentItem += this.options.slideToScroll;

        } else if(this.currentItem + this.options.slideToScroll >= this.itemWrappers.length && this.options.loop) {

            setSlide = true;
            this.lastItem = this.currentItem;
            this.currentItem = 0;
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

        if(this.currentItem - this.options.slideToScroll >= 0) {

            setSlide = true;
            this.lastItem = this.currentItem;
            this.currentItem -= this.options.slideToScroll;

        } else if(this.currentItem - this.options.slideToScroll < 0 && this.options.loop) {

            setSlide = true;
            this.lastItem = this.currentItem;
            this.currentItem = this.itemWrappers.length - 1;
        }

        return setSlide;
    }

    /**************************** Callback functions **************************/

    /**
     * Callback function called when "click" event occurs on the right
     * navigation button.
     * 
     * @description: This function go to previous slides if rtl is active or go
     * next slides else.
     */
    toRight() {

        let setSlide = false;

        if (this.options.rtl)
            setSlide = this.gotoPreviousSlide();

        else
            setSlide = this.gotoNextSlide();

        if (setSlide)
            this.slide();
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

        if (this.options.rtl)
            setSlide = this.gotoNextSlide();

        else
            setSlide = this.gotoPreviousSlide();

        if (setSlide)
            this.slide();
    }


    /**
     * Callback function called when "click" event occurs on the pagination
     * buttons.
     * 
     * @description: This function go to next slides if rtl is active or go
     * next slides else.
     */
    paginationClick(event) {

        let i = Array.from(this.pagination.children).indexOf(event.target);

        let j = this.options.pagination.forEachSlide ? i : i * this.options.slideToShow;

        if (j >= this.itemWrappers.length)
            j = this.itemWrappers.length - 1;

        if (j != this.currentItem) {

            Array.from(this.pagination.children).forEach( child => child.classList.remove('is_active') );

            this.lastItem = this.currentItem;

            this.currentItem = j;
            console.log(this.currentItem)
            event.target.classList.toggle('is_active');
            this.slide();
        }
    }


    /**
     * Callback function to the window resize event.
     * 
     * @description: This function update the slider settings to the currents callback
     * according the responsive object in the slider options.
     */
    onResize(event) {

        this.options.responsive.forEach(responsive => {
                
            if (window.innerWidth <= responsive.breakpoint)
                this.resetOptions(responsive.options);

            else 
                this.resetOptions(this.options);

        });
    }
}



document.addEventListener('DOMContentLoaded', function() {

    const sliders = document.getElementsByClassName('slider');

    for(let slider of sliders) {
        let x = new Slider(slider, {});
    }

});
