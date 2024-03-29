
class TakeMePhoto {

    constructor({
        containerId,
        width=400,
        height=400
    }) {

        this.config = {
            started: false,
            capturing: false,
        }

        this.container = document.querySelector(`#${containerId}`);
        // Creating The Video Element with the hight and the width
        const video = document.createElement('video');
        video.width = width;
        video.height = height;
        video.autoplay = true;
        video.loop = true;
        this.video = video;

        const wrapper = document.createElement('div');
        wrapper.height = height;
        wrapper.width = width;
        this.wrapper = wrapper;

        // Creating the Timer 
        const timer = document.createElement('span');
        timer.textContent = '';
        timer.style.fontSize = '30px';
        timer.style.fontWeight = 'bold';
        timer.style.color = 'blue';
        timer.style.display = 'block';
        this.timer = timer;
        
        
        //Creating the Wrapper
        const capture = document.createElement('div');
        this.capture = capture;


        //Creating The Canvas and we give it the same width and height
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        this.canvas = canvas;
        this.capture.appendChild(this.canvas);


        // Creating The Capture Button ;
        const captureButton = document.createElement('button');
        captureButton.textContent = 'capturer';
        captureButton.style = 'display: block; width: 150px; margin-left: 59px;';
        this.captureButton = captureButton;

        this.constraints = {
            audio: false,
            video: { width, height }
        }

    }

    start() {

            this.container.appendChild(this.video);
            this.container.appendChild(this.captureButton);
            this.container.appendChild(this.timer);
            this.container.appendChild(this.capture);

            this.initStream();
            this.initFilters();
         
    }

    async initStream() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
            this.showStream(this.stream);
        } catch (e) {
            this.userMediaError(e);
            throw e;
        }
    }

    userMediaError(e) {    
        this.timer.textContent = e;

        this.captureButton.remove();
        this.canvas.remove();
    }

    showStream(stream) {
        window.stream = stream;
        this.video.srcObject = stream;
        this.captureListener();
    }

    takePicture() {
         const { filter: { initialized } } = this.config;

        if(!initialized) this.setupFilters();
        const context = this.canvas.getContext('2d');
        context.drawImage(this.video, 0, 0);
        this.config.capturing = false;
      
    }

    captureListener() {
        this.captureButton.addEventListener("click", () => {
            const timer = (i, callback) => {
                if( i>0 ){
                    this.timer.innerHTML = `${i}`;
                    setTimeout(timer, 1000, --i, callback.bind(this));
                    return;
                }
                this.timer.innerHTML = ``;
                callback();
            }
                timer(3, this.takePicture);
            
        });
    }

     /**
     * Configure filters buttons and append them to the dom
     * setup the click listeners
    */
    setupFilters() {
        this.config.filter.initialized = true;
        
        const { filter: {filterNames, filterFuncs} } = this.config;

        filterNames.map((filter, i) => {
            const button = document.createElement('button');
            button.textContent = filter;
            if(filter == 'Sepia'){
                button.style = 'display : block; visibility : hidden';
            }
            button.className = 'takemephoto-filter'; // to give the users the ability to style the buttons
            button.addEventListener('click', () => this.setupFilter(filterFuncs[i]));
            
            this.capture.appendChild(button);
        });
        const cropButton = document.createElement('button');
        cropButton.textContent = 'recadrer';
        //cropButton.className = 'takemephoto-btn'; // to give the users the ability to style the buttons
        cropButton.addEventListener('click', () => this.setupCrop() );
        
        this.capture.appendChild(cropButton);

        // const button = document.createElement('button');
        // button.textContent = 'recadrer';
        // button.addEventListener('click',this.encadrer());
        // this.capture.appendChild(button);
    }


    setupCrop() {

        const cropContainer = document.createElement('div');
        cropContainer.style = 'display: flex; flex-direction: row; justify-content: center; position: fixed; background-color: rgba(0, 0, 0, 0.5); height: 100%; width: 100%; top: 0; left: 0;';

        const wrapper = document.createElement('div');
        wrapper.id = 'takemephoto-wrapper'; // this will help the user style takeme-photo elements
        wrapper.style = 'width: 400px; align-self: center; display: grid; grid-template-columns: 1fr 1fr; grid-gap: 4px;';
        cropContainer.appendChild(wrapper);

        // const cancel = document.createElement('button');
        // cancel.id = 'takemephoto-cancel'; // gives the user the ability to style the cancel button
        // cancel.textContent = 'Cancel';
        // wrapper.appendChild(cancel);

        const apply = document.createElement('button');
        apply.textContent = 'Enregistrer';
        apply.style = 'width : 300px';
        wrapper.appendChild(apply);


        // Resizable Setup
        const resizableContainer = document.createElement('div');
        resizableContainer.classList.add('resizable-container');
        resizableContainer.style.position = 'relative';
        resizableContainer.style.gridColumn = '1/ span 2';
        wrapper.appendChild(resizableContainer);


        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        canvas.getContext('2d').drawImage(this.canvas, 0, 0);
        resizableContainer.appendChild(canvas);

        const resizable = document.createElement('div');
        resizable.classList.add('resizable');
        resizable.style = `position: absolute; top: 0; left: 0; width: ${canvas.width}px; height: ${canvas.height}px; border: 2px dashed #000; box-sizing: border-box; cursor: move;z-index: 9999;`;
        resizableContainer.appendChild(resizable);

        // Resize Wrists Start
        const resizeWristSize = 5;
        // resize-wrists params
        const resizeWristsParams = [
            {
                className: 'no',
                style: 'top: -5px; left: -5px; cursor: nwse-resize;',
            },
            {
                className: 'nn',
                style: `top: -5px; left: ${canvas.width/2 - resizeWristSize}px; cursor: ns-resize;`,
            },
            {
                className: 'ne',
                style: 'top: -5px; right: -5px; cursor: nesw-resize;',
            },
            {
                className: 'oo',
                style: `top: ${canvas.height/2 - resizeWristSize}px; left: -5px; cursor: ew-resize;`,
            },
            {
                className: 'ee',
                style: `top: ${canvas.height/2 - resizeWristSize}px; right: -5px; cursor: ew-resize;`,
            },
            {
                className: 'so',
                style: 'bottom: -5px; left: -5px; cursor: nesw-resize;',
            },
            {
                className: 'ss',
                style: `bottom: -5px; left: ${canvas.width/2 - resizeWristSize}px; cursor: ns-resize;`,
            },
            {
                className: 'se',
                style: 'bottom: -5px; right: -5px; cursor: nwse-resize;',
            },
        ];

        const resizeWrists = resizeWristsParams.map(resizeWristsParam => {
            const resizeWrist = document.createElement('span');
            resizeWrist.classList.add('resize-wrist', resizeWristsParam.className);
            resizeWrist.style = `display:block; position: absolute; background-color: black; width: ${resizeWristSize * 2}px; height: ${resizeWristSize * 2}px;${resizeWristsParam.style}`;
            resizable.appendChild(resizeWrist);

            return resizeWrist;
        });

        // ****************** Listeners Setup *******************

        // create drag and drop behaviour for the resizable element
        resizable.onmousedown = (e) => {

            if(e.target != resizable) return false;

            const original_x = resizable.getBoundingClientRect().left - canvas.getBoundingClientRect().left;
            const original_y = resizable.getBoundingClientRect().top - canvas.getBoundingClientRect().top;
            const { width, height } = resizable.getBoundingClientRect();

            const original_mouse_x = e.pageX;
            const original_mouse_y = e.pageY;

            const { left:leftLimit, right:rightLimit, top:topLimit, bottom:bottomLimit } = canvas.getBoundingClientRect();

            function startMoving(e) {

                const left = original_x + (e.pageX - original_mouse_x);
                const top = original_y + (e.pageY - original_mouse_y);

                if( (leftLimit+left+width) <= rightLimit ) {
                    if(left >= 0) {
                        resizable.style.left = `${left}px`;
                    }else {
                        resizable.style.left = '0';
                    }
                }else {
                    resizable.style.left = `${rightLimit-leftLimit-width}px`;
                }
                
                if( (topLimit+top+height) <= bottomLimit ) {
                    if(top >= 0) {
                        resizable.style.top = `${top}px`;
                    }else {
                        resizable.style.top = `0`;
                    }
                }else {
                    resizable.style.top = `${bottomLimit-topLimit-height}px`;
                }
            }

            function stopMoving() {
                window.removeEventListener('mousemove', startMoving);
                window.removeEventListener('mouseup', stopMoving);
            }

            window.addEventListener('mousemove', startMoving);
            window.addEventListener('mouseup', stopMoving);

        }

        // create the controls for the reisze wrists
        resizeWrists.forEach(resizeWrist => {

            resizeWrist.onmousedown = (e) => {

                const MIN_SIZE = 20;

                const { width:original_width, height:original_height } = resizable.getBoundingClientRect();


                const original_x = resizable.getBoundingClientRect().left - canvas.getBoundingClientRect().left;
                const original_y = resizable.getBoundingClientRect().top - canvas.getBoundingClientRect().top;

                const original_mouse_x = e.pageX;
                const original_mouse_y = e.pageY;

                const { left:leftLimit, right:rightLimit, top:topLimit, bottom:bottomLimit } = canvas.getBoundingClientRect();

                function updateCenterWrists() {
                    resizeWrists.forEach(resizeWrist => {

                        const classList = resizeWrist.classList;
                        const { width, height } = resizable.getBoundingClientRect();

                        if(classList.contains('nn') || classList.contains('ss')) {
                            resizeWrist.style.left = `${width/2 - resizeWristSize}px`;
                            return ;
                        }

                        if(classList.contains('oo') || classList.contains('ee')) {
                            resizeWrist.style.top = `${height/2 - resizeWristSize}px`;
                            return ;
                        }

                    });
                }
            
                function startResizing(e) {

                    const classList = resizeWrist.classList;

                    if(classList.contains('no')) {

                        const width = original_width - (e.pageX - original_mouse_x);
                        const height = original_height - (e.pageY - original_mouse_y);
                        const left = original_x + (e.pageX - original_mouse_x);
                        const top = original_y + (e.pageY - original_mouse_y);

                        if(width >= MIN_SIZE && left >= 0) {
                            resizable.style.width = `${width}px`;
                            resizable.style.left = `${left}px`;
                        }

                        if(height >= MIN_SIZE && top >= 0) {
                            resizable.style.height = `${height}px`;
                            resizable.style.top = `${top}px`;
                        }

                        updateCenterWrists();
                        
                        return ;
                    }
                    if(classList.contains('nn')) {

                        const height = original_height - (e.pageY - original_mouse_y);
                        const top = original_y + (e.pageY - original_mouse_y);

                        if(height >= MIN_SIZE && top >= 0) {
                            resizable.style.height = `${height}px`;
                            resizable.style.top = `${top}px`;
                        }

                        updateCenterWrists();
                        
                        return ;
                    }
                    if(classList.contains('ne')) {

                        const width = original_width + (e.pageX - original_mouse_x);
                        const height = original_height - (e.pageY - original_mouse_y);
                        const top = original_y + (e.pageY - original_mouse_y);

                        if(width >= MIN_SIZE && (leftLimit+original_x+width <= rightLimit) ) {
                            resizable.style.width = `${width}px`;
                        }

                        if(height >= MIN_SIZE && top >= 0) {
                            resizable.style.height = `${height}px`;
                            resizable.style.top = `${top}px`;
                        }

                        updateCenterWrists();
                        
                        return ;
                    }

                    if(classList.contains('oo')) {

                        const width = original_width - (e.pageX - original_mouse_x);
                        const left = original_x + (e.pageX - original_mouse_x);

                        if(width >= MIN_SIZE && left >= 0) {
                            resizable.style.width = `${width}px`;
                            resizable.style.left = `${left}px`;
                        }

                        updateCenterWrists();
                        
                        return ;
                    }
                    if(classList.contains('ee')) {

                        const width = original_width + (e.pageX - original_mouse_x);

                        if(width >= MIN_SIZE && (leftLimit+original_x+width <= rightLimit)) {
                            resizable.style.width = `${width}px`;
                        }

                        updateCenterWrists();
                        
                        return ;
                    }

                    if(classList.contains('so')) {

                        const width = original_width - (e.pageX - original_mouse_x);
                        const height = original_height + (e.pageY - original_mouse_y);
                        const left = original_x + (e.pageX - original_mouse_x);

                        if(width >= MIN_SIZE && left >= 0) {
                            resizable.style.width = `${width}px`;
                            resizable.style.left = `${left}px`;
                        }

                        if(height >= MIN_SIZE && (topLimit+original_y+height <= bottomLimit) ) {
                            resizable.style.height = `${height}px`;
                        }

                        updateCenterWrists();
                        
                        return ;
                    }
                    if(classList.contains('ss')) {

                        const height = original_height + (e.pageY - original_mouse_y);

                        if(height >= MIN_SIZE && (topLimit+original_y+height <= bottomLimit) ) {
                            resizable.style.height = `${height}px`;
                        }

                        updateCenterWrists();
                        
                        return ;
                    }
                    if(classList.contains('se')) {

                        const width = original_width + (e.pageX - original_mouse_x);
                        const height = original_height + (e.pageY - original_mouse_y);

                        if(width >= MIN_SIZE && (leftLimit+original_x+width <= rightLimit) ) {
                            resizable.style.width = `${width}px`;
                        }

                        if(height >= MIN_SIZE && (topLimit+original_y+height <= bottomLimit) ) {
                            resizable.style.height = `${height}px`;
                        }

                        updateCenterWrists();
                        
                        return ;
                    }

                }
            
                function stopResizing() {
                    window.removeEventListener('mousemove', startResizing);
                    window.removeEventListener('mouseup', stopResizing);
                }
            
                window.addEventListener('mousemove', startResizing);
                window.addEventListener('mouseup', stopResizing);
            }

        });

    
        apply.addEventListener('click', () => {

            const { left, top, width, height } = resizable.getBoundingClientRect();
            const { left:canvasLeft, top:canvasTop } = canvas.getBoundingClientRect();
            
            const o_left = left - canvasLeft;
            const o_top = top - canvasTop;

            const context = this.canvas.getContext('2d');
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            context.drawImage(canvas, o_left, o_top, width, height, 0, 0, this.canvas.width, this.canvas.height);
            cropContainer.remove();
        });

        cropContainer.addEventListener('click', (e) => {
            if(e.target === cropContainer) {
                cropContainer.remove();
            }
        });

        this.container.appendChild(cropContainer);
    }

    setupFilter(filter) {
        const filterContainer = document.createElement('div');
        filterContainer.style = 'display: flex; flex-direction: row; justify-content: center; position: fixed; background-color: rgba(0, 0, 0, 0.5); height: 100%; width: 100%; top: 0; left: 0;';

        const wrapper = document.createElement('div');
        wrapper.id = 'takemephoto-wrapper'; // this will help the user style takeme-photo elements
        wrapper.style = 'width: 400px; align-self: center; display: grid; grid-template-columns: 1fr 1fr; grid-gap: 4px;';

        // const cancel = document.createElement('button');
        // cancel.id = 'takemephoto-cancel'; // gives the user the ability to style the cancel button
        // cancel.textContent = 'Cancel';
        // wrapper.appendChild(cancel);

        const apply = document.createElement('button');
        apply.id = 'takemephoto-apply'; // gives the user the ability to style the apply button
        apply.textContent = 'Enregistrer';
        apply.style = 'width:300px;'
        wrapper.appendChild(apply);

        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        canvas.style = 'grid-column: 1/ span 2;';
        canvas.getContext('2d').drawImage(this.canvas, 0, 0);
        wrapper.appendChild(canvas);

        // slider starts
        const sliderWrapper = document.createElement('div');
        sliderWrapper.style = 'grid-column: 1/ span 2;display: grid;grid-template-columns: 9fr 1fr;width: 342px;';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = filter.min;
        slider.max = filter.max;
        slider.value = filter.default;

        sliderWrapper.appendChild(slider);

        const span = document.createElement('span');
        span.textContent = `${filter.default}${filter.unit}`;
        span.style = 'color: white; font-weight: bold;';
        sliderWrapper.appendChild(span);

        wrapper.appendChild(sliderWrapper);

        // listeners setup
        slider.addEventListener('input', (e) => {
            span.textContent = `${e.target.value}${filter.unit}`;
            this.applyFilter(canvas, e.target.value, filter);
        });

        // cancel.addEventListener('click', () => {
        //     filterContainer.remove();
        // });

        apply.addEventListener('click', () => {
            const context = this.canvas.getContext('2d');
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            context.drawImage(canvas, 0, 0);
            filterContainer.remove();
        });

        filterContainer.addEventListener('click', (e) => {
            if(e.target === filterContainer) {
                filterContainer.remove();
            }
        });

        filterContainer.appendChild(wrapper);
        this.container.appendChild(filterContainer);
    }

    /** 
     * this function applies the given filter to the given canvas
    */
   applyFilter(canvas, value, filter) {

        const { name, unit } = filter;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = `${name}(${value}${unit})`;
        ctx.drawImage(this.canvas, 0, 0);
   }
    /**
     * Initialize filters configuration from functions names to filters properties...  
    */
    initFilters() {
        this.config.filter = {
            initialized: false,
            filterNames: ['Sepia','Blur', 'Brightness', 'Opacity', 'Saturate'],
            filterFuncs: [
                {
                    name: 'sepia',
                    unit: '%',
                    default: 0,
                    min: 0,
                    max: 100,
                },
                {
                    name: 'blur',
                    unit: 'px',
                    default: 0,
                    min: 0,
                    max: 50,
                },
                {
                    name: 'brightness',
                    unit: '%',
                    default: 100,
                    min: 0,
                    max: 200,
                },
               
                {
                    name: 'opacity',
                    unit: '%',
                    default: 100,
                    min: 0,
                    max: 100,
                },
                {
                    name: 'saturate',
                    unit: '%',
                    default: 100,
                    min: 0,
                    max: 100,
                }
            ],

        }
    }
}