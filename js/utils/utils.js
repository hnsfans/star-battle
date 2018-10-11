const log = console.log.bind(console);

const $ = elem => document.querySelector(elem);

const $s = elem => document.querySelectorAll(elem);

const style = (el, styleObj) => {
    for (let i in styleObj) {
        el.style[i] = styleObj[i];
    }
}

const on = (el, type, callback) => {
    el.addEventListener(type, callback);
}

const random = (end, start) => {
    return Math.floor(Math.random() * (end - start)) + start;
};

const randomArrayItem = (array) => {
    return array[random(0, array.length)];  
};

const isArray = (array) => {
    return array instanceof Array;
}

const isImage = (img)=>{
    return img instanceof Image;
}

const raf = (()=>{

    let events = {};

    const reg = (id,callback)=>{
        if (events[id]){
            return console.error('id 已存在');
        }
        events[id] = callback;
    };

    const remove = (id)=>{
        if (!events[id]) return;
        delete events[id];
    };

    const clearAll = ()=>{
        events = {};
    };

    const update = ()=>{
        for (const fn of Object.values(events)){
            fn();
        }
        requestAnimationFrame(update);
    }

    update();

    return {
        reg : reg,
        remove : remove,
        clearAll : clearAll,
    }

})();

const HotKey = (() => {

    let data = {};

    const regKeyCode = (keyCode) => {
        data[keyCode] = {
            active: false,
            events: [],
        }
    }

    const loop = () => {
        Object.keys(data).map(key => {
            let event = data[key];
            if (!event.active) {
                return;
            }
            event.events.forEach(el => {
                if (el.enable) {
                    el.callback();
                }
                if (el.once) {
                    el.enable = false;
                }
            });
        });
    };

    raf.reg('HotKey_loop',loop);

    on(window, 'keydown', e => {
        let keyCode = e.key.toLocaleUpperCase();
        if (!data[keyCode]) {
            return;
        }
        e.preventDefault();
        data[keyCode].active = true;
    });
    on(window, 'keyup', e => {
        let keyCode = e.key.toLocaleUpperCase();
        if (!data[keyCode]) {
            return;
        }
        data[keyCode].active = false;
        data[keyCode].events.forEach(el => {
            if (el.once) {
                el.enable = true;
            }
        });
    });


    loop();


    return {
        reg: (keyCode, callback, once = false) => {
            keyCode = "" + keyCode;
            keyCode = keyCode.toLocaleUpperCase();
            if (!data[keyCode]) {
                regKeyCode(keyCode);
            }
            data[keyCode].events.push({
                once,
                callback,
                enable: true,
            })
        },
        clearAll : ()=>{
            data = {};
        }
    }

})();


const loadResource = (list, Obj, callback) => {
    const keys = Object.keys(list);
    const result = {};
    const len = keys.length;
    const load = Obj === Image ? 'onload' : 'onloadedmetadata';
    let count = 0;
    const call = (obj, key) => {
        count++;
        result[key] = obj;
        if (len === count) {
            callback(result);
        }
    };
    keys.map((key) => {
        const obj = new Obj();
        obj.src = list[key];
        obj[load] = () => {
            call(obj, key)
        };
    });
}

const loadImages = (images, callback) => {
    return loadResource(images, Image, callback);
};

const loadAudios = (audios, callback) => {
    return loadResource(audios, Audio, callback);
};

const incrementAnimation = (start,end,callback)=>{
    let current = start;
    const status = start < end;
    const time = setInterval(()=>{
        status ? current++ : current--;
        callback(current);
        if (current === end){
            clearInterval(time);
        }
    },30)
}

const localStorageData = (()=>{

    const add = (obj)=>{
        const gameData = get();
        gameData.data.push(obj);
        localStorage.gameData = JSON.stringify(gameData);
    }

    const get = ()=>{
        return localStorage.gameData ? JSON.parse(localStorage.gameData) : {
            data : [],
        };
    }

    update = (data)=>{
        localStorage.gameData = JSON.stringify({
            data,
        });
    }

    return {
        add : add,
        get : get,
        update : update,
    }

})();