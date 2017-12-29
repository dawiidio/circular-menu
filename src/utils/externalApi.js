import CircleMenu from '../parts/CircleMenu';
import FirstLevelSlice from '../parts/FirstLevelSlice';
import NthLevelSlice from '../parts/NthLevelSlice';
import {
    dumpExtend
} from './utils';
import {
    MENU_DEFAULTS,
    SLICE_DEFAULTS,
} from '../config/defaults';

const OPTIONS_DEFAULTS = {
    menu        : MENU_DEFAULTS,
    slice       : SLICE_DEFAULTS,
    slices      : [],
    onOpen      : null,
    onClose     : null
};

// todo save as module
// todo ng5 module

/**
 * Simple factory function for Menu
 * 
 * @param selector {string}
 * @param newOptions {Object}
 * @param defaultOptions {Object}
 * @returns {Menu}
 */
const createInstance = (selector, newOptions, defaultOptions) => {
    const instanceOptions    = dumpExtend({}, defaultOptions, newOptions);
    const mapedSlices        = instanceOptions.slices.map( slice => ({...defaultOptions.slice, ...slice}) );
    const newMenuInstance    = new CircleMenu(selector, instanceOptions.menu);

    const createSlices = (slices, parent) => {
        slices.forEach(sliceOptions => {
            const options = {...defaultOptions.slice, ...sliceOptions};
            const slice   = parent instanceof CircleMenu 
                ? new FirstLevelSlice(newMenuInstance.svg, options)
                : new NthLevelSlice(newMenuInstance.svg, options);
    
            if(options.slices.length)
                createSlices(options.slices, slice);

            parent.pushSlice( slice );
        });
    }

    createSlices(instanceOptions.slices, newMenuInstance)

    return newMenuInstance.draw();
};

/**
 * 
 * @param selector
 * @param userOptions
 * @returns {{open: (function()), close: (function())}}
 */
export default (selector, userOptions) => {
    let isOpen    = false;
    
    const defaultInstanceOptions = dumpExtend({}, OPTIONS_DEFAULTS, userOptions);
    
    let menuInstance = createInstance(selector, defaultInstanceOptions, defaultInstanceOptions);

    /**
     * close menu
     */
    const close = ev => {
        menuInstance
            .hide()
            .then(() => menuInstance.destroy());

        document.removeEventListener('click', close);
        isOpen = false;
    };

    /**
     * open menu
     * @param ev
     */
    const open = (ev) => {
        const dynamicOptions = defaultInstanceOptions.onOpen();
        
        menuInstance = createInstance(selector, dynamicOptions, defaultInstanceOptions);

        let positionX = ev.x-menuInstance.radiusWithPadding;
        let positionY = ev.y-menuInstance.radiusWithPadding;

        const size = menuInstance.size;

        if(positionX < 0)
            positionX = 0;
        else if(positionX + size > window.innerWidth)
            positionX = window.innerWidth - size - 15;

        if(positionY < 0)
            positionY = 0;
        else if(positionY + size > window.innerHeight)
            positionY = window.innerHeight - size;

        menuInstance.svg.style({ transform: `translate3d(${positionX}px, ${positionY}px, 0)` });
        menuInstance.show();

        document.addEventListener('click', close);
        isOpen = true;
    };

    /**
     * trigger menu
     * 
     * @param ev {Event}
     */
    const trigger = (ev) => {
        ev.preventDefault();

        if(isOpen)
            close(ev);
        else
            open(ev);
    };
    
    document.body.addEventListener('contextmenu', trigger);
    
    return {
        open,
        close
    }
}