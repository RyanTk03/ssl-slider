
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
        //The current slider showing
        this.currentItem = 0;
        
        //The number of item in the slider
        let itemLength = this.element.children.length;
        //The width of each item
        let itemWidth = this.options.adaptiveWidth ? (100 / itemLength) + '%' : 'auto';

        this.container = this.createElementWithClass('div', 'slider__container');
        this.container.style.width = this.options.adaptiveWidth ? ((100 / this.options.slideToShow) * itemLength) + '%' : 'max-content';
        this.element.appendChild(this.container);

        this.element.style.width = this.options.overflow.active ? `calc(100% - ${this.options.overflow.size})` : '100%';

        Array.from(this.element.children).forEach(child => {

            if (!child.classList.contains('slider__container')) {

                let elt = this.createElementWithClass('div', 'slider__item');
                elt.style.width = itemWidth;
                elt.appendChild(child);
                this.container.appendChild(elt);
                this.itemWrappers.push(elt); 
            }
        });
        if (this.options.rtl) {
                
            this.container.style.direction = 'rtl';

            let translate = this.itemWrappers.reduce((accumulateur, element, indice) => 
                accumulateur += (indice + this.options.slideToShow < itemLength) ? element.offsetWidth : 0, 0);
    
            this.container.style.transform = `translateX(-${translate}px)`;
        }

        this.initPagination();

        this.initNavigation();

        if (this.options.autoPlay.active) {
            setInterval(() => rtl ? this.toLeft() : this.toRight(), this.options.autoPlay.delay);
        }

        window.addEventListener('resize', this.onResize.bind(this));
    }

    onResize(event) {

        this.options.responsive.forEach(responsive => {
                
            if (window.innerWidth <= responsive.breakpoint)
                this.resetOptions(responsive.options);

            else 
                this.resetOptions(this.options);

        });
    }

    /**
     * Create the navigation of the slider
     */
    initNavigation() {

        if (this.itemWrappers.length > this.options.slideToShow && this.options.navigation.active) {

            //The html container for the navigation
            this.navigation = this.createElementWithClass('div', 'slider__navigation');

            //The toLeftious button
            let toLeft = this.createElementWithClass('div', 'slider__navigation__toLeft');
            toLeft.innerHTML = this.options.navigation.arrow == 'full' ? "&#129120;" :
                this.options.navigation.arrow == 'head' ? "&#10094;" : "&#129168;";
            toLeft.addEventListener('click', this.toLeft.bind(this));

            //The toRight button
            let toRight = this.createElementWithClass('div', 'slider__navigation__toRight');
            toRight.innerHTML = this.options.navigation.arrow == 'full' ? "&#129122" : 
                this.options.navigation.arrow == 'head' ? "&#10095;" : "&#129170;";
            toRight.addEventListener('click', this.toRight.bind(this));

            this.navigation.appendChild(toLeft);
            this.navigation.appendChild(toRight);

            if(this.options.navigation.position === 'top') {
                this.element.insertAdjacentElement('afterbegin', this.navigation);
            } else {
                this.element.insertAdjacentElement('beforeend', this.navigation);
            }

            this.updateNavigation();
        }
    }

    /**
     * Create and init the pagination
     */
    initPagination() {

        if (this.options.pagination.active) {

            let x = Math.ceil(this.itemWrappers.length / this.options.slideToShow);

            //The html container for the navigation
            this.pagination = this.createElementWithClass('div', 'slider__pagination');

            //The pagination button
            for (let i = 0; i < x; i++) {

                let button = this.createElementWithClass('div', 'slider__pagination__button');
                if(i == 0) button.classList.add('is_active');

                button.addEventListener('click', event => {

                    Array.from(this.pagination.children).forEach( child => child.classList.remove('is_active') );

                    let j = Array.from(this.pagination.children).indexOf(event.target);
                    this.currentItem = j * this.options.slideToShow;
                    event.target.classList.toggle('is_active');
                    this.slide();
                });
                this.pagination.appendChild(button);
            }

            this.element.insertAdjacentElement('beforeend', this.pagination);
        }
    }

    /**
     * Update the navigation by displaying or hide the button
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
     * Update the pagination when user navigate
     */
    updatePagination() {

        Array.from(this.pagination.children).forEach( child => child.classList.remove('is_active') );

        let i = Math.ceil(this.currentItem / this.options.slideToShow);

        this.pagination.children[i].classList.add('is_active');
    }

    toRight(event, rtlTested=false) {

        if (rtlTested || !this.options.rtl) {

            if(this.currentItem + this.options.slideToScroll < this.itemWrappers.length)
                this.currentItem += this.options.slideToScroll;

            else if(this.currentItem + this.options.slideToScroll >= this.itemWrappers.length && this.options.loop)
                this.currentItem = 0;

            this.slide();
        
        } else
            this.toLeft(event, true);
    }

    toLeft(event, rtlTested=false) {

        if (rtlTested || !this.options.rtl) {

            if (this.currentItem - this.options.slideToScroll >= 0)
                this.currentItem -= this.options.slideToScroll;

            else if(this.currentItem - this.options.slideToScroll < 0 && this.options.loop)
                this.currentItem = this.itemWrappers.length - 1;

            this.slide();
        } else
            this.toRight(event, true);
    }

    slide() {

        let translate = this.itemWrappers.reduce((accumulateur, element, indice) => {

            if (this.options.rtl) {

                let i = 0;
                if (this.currentItem < this.options.slideToShow)
                    i = this.options.slideToShow - this.currentItem;

                accumulateur += (indice >= this.currentItem + this.options.slideToShow) ? element.offsetWidth : 0;

            } else
                accumulateur += (indice < this.currentItem) ? element.offsetWidth : 0;

            return accumulateur;
        }, 0);
        
        this.container.style.transform = `translateX(-${translate}px)`;

        this.updateNavigation();

        this.updatePagination();
    }

    resetOptions(newOptions) {

    }

    /**
     * 
     * @param {string} element 
     * @param {string} className 
     * @returns HTMLElement
     */
    createElementWithClass(element, className) {
        let elt = document.createElement(element);
        elt.setAttribute('class', className);

        return elt;
    }
}
        
document.addEventListener('DOMContentLoaded', function() {

    const sliders = document.getElementsByClassName('slider');

    for(let slider of sliders) {
        let x = new Slider(slider, {});
    }

});
