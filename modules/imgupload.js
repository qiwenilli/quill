import Quill from '../core/quill';
import Module from '../core/module';
import logger from '../core/logger';
import Axios from 'axios';
import {Buffer} from 'buffer';
import Blob from 'blob';
// import Delta from 'quill-delta';

// require('buffer').Buffer
const con = console;

let debug = logger('quill:imgupload');

class Imgupload extends Module {

    constructor(quill, options = {}) {
        super(quill, options);
        if (window.katex == null) {
            // throw new Error('Formula module requires KaTeX.');
        }

        debug.log(options);

        let timer = null;
        this.quill.on(Quill.events.TEXT_CHANGE, (delta, oldDelta, source) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                this.upload(delta, oldDelta, source);
                timer = null;
            }, this.options.interval);
        });
        // this.upload(delta);

        debug.log("upload");
    }

    upload(delta, oldDelta, source) {

        debug.log("|----------------------------------------------|");
        debug.log("|       author : qiwen<34214399@qq.com>        |");
        debug.log("|http://img.zcool.cn/community/01793359252533a801216a3eccfe23.gif ");
        debug.log("|http://img.zcool.cn/community/01a21256f0a5de32f875a9441f4398.gif ");
        debug.log("|http://img0.imgtn.bdimg.com/it/u=1751646155,3312222114&fm=214&gp=0.jpg");
        debug.log("|http://img.zcool.cn/community/0195f55972f18ca8012193a342310a.gif ");
        debug.log("|https://www.iamue.com/wp-content/uploads/2016/04/1461238685-7590-AH8XpGSRvI6argd7icKur8iblicQ.gif ");
        debug.log("|http://img.zcool.cn/community/01898c58c3fb28a801219c77a2fb5a.gif ");
        debug.log("|       author : qiwen<34214399@qq.com>        |");
        debug.log("|----------------------------------------------|");

        debug.log(this.options);

        con.log(">>>", delta, oldDelta, source);

        const quill = this.quill;

        let _uploadimg = this.options.uploadgif || "https://www.iamue.com/wp-content/uploads/2016/04/1461238701-6635-Atic0ItV1H6FUGvpKFnAhhwfgMDA.gif";


        let q = quill.getContents();

        // 使用遍历所有的delta判断是image base64 就替换成 上传中动图，并增加alt 用于上传成功后替换成原图片
        let _modify = false;
        [].forEach.call(q.ops, (o, i) => {
            if (o.insert != undefined) {

                if ((typeof o.insert.image) == "string" && /^data:image\/.+;base64/.test(o.insert.image)) {

                    let _filename = "file_" + Date.parse(new Date()) + ".png";

                    q.ops[i] = {
                        insert : {
                            image : _uploadimg
                        },
                        attributes : {
                            alt : _filename,
                        }
                    };
                    _modify = true;
                    // 这里处理上传
                    this.uploadProcess(o.insert.image, _filename);
                }
            }
        });
        if(_modify == true){
            quill.setContents(q);
        }

        // let _retain = 0;
        // [].forEach.call(delta.ops, (o, i) => {

        //     debug.log(i, o);

        //     if((typeof o.retain) == "number" && _retain == 0){
        //         _retain = o.retain;
        //     }

        //     if (o.insert != undefined) {
        //         if ((typeof o.insert.image) == "string" && /^data:image\/.+;base64/.test(o.insert.image)) {

        //             let _uploadimg = "https://ss0.baidu.com/73F1bjeh1BF3odCf/it/u=2356291704,864378916&fm=85&s=88C27A230EF6A8D20C59F5020100C0C1";

        //             let _filename = "file_" + Date.parse(new Date()) + ".png";
        //             delta.ops[i] = {
        //                 insert : {
        //                     image : _uploadimg
        //                 },
        //                 attributes : {
        //                     alt : _filename,
        //                 }
        //             };

        //             quill.update("api");

        //             // quill.updateContents(new Delta()
        //             //     .retain(_retain - 1)
        //             //     .delete(1)
        //             //     .insert({
        //             //         image: _uploadimg,
        //             //     }, {
        //             //         alt: _filename
        //             //     })
        //             //     .retain(1)
        //             //     .insert(" ")
        //             // );
        //             // 这里处理上传
        //             // this.uploadProcess(delta, o.insert.image, _filename);
        //         }
        //     }
        // });

    }

    uploadProcess(base64String, _filename) {
        if ((typeof this.options.cross) != "undefined" && this.options.cross == true) {
            Axios.defaults.withCredentials = true;
            Axios.defaults.crossDomain = true;
        }
        let _file = "file";
        if ((typeof this.options.filename) != "undefined" && this.options.filename != "") {
            _file = this.options.filename;
        }

        let binaryData = new Blob(new Buffer(base64String), {
            type: "image/png"
        });

        let formData = new FormData();
        formData.append(_file, binaryData, _filename);

        let opt = this.options;
        Object.keys(opt.postdata).forEach((k) => {
            formData.append(k, new Buffer(opt.postdata[k].toString()));
            con.log(k, "====", opt.postdata[k]);
        });

        debug.log("post form");
        con.log(formData);

        let config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        const quill = this.quill;
        const _update = this.update;
        Axios.post(this.options.url, formData, config)
            .then(function(response) {

                con.log(response);

                let img = opt.callfun(response);

                _update(quill, img, _filename);
            }).catch(function(err) {

                con.log(err);

                let img = opt.callfun(err);

                _update(quill, img, _filename);
            });
    }

    update(quill, img, _filename){

        let q = quill.getContents();

        con.log(q, img, _filename);

        let _modify = false;
        [].forEach.call(q.ops, (o, i) => {

            if (o.insert != undefined) {
                if ((typeof o.insert.image) == "string" && (typeof o.attributes.alt) == "string" && o.attributes.alt == _filename) {
                    q.ops[i].insert.image = img;
                    _modify = true;
                }
            }
        });
        if(_modify == true){
            quill.setContents(q);
        }
    }
}

export {
    Imgupload as
    default
}
