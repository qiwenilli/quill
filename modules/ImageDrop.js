import Module from '../core/module';
import logger from '../core/logger';

let debug = logger('quill:imgupload');

class Imgupload extends Module {

    constructor(quill, options = {}) {
        super(quill, options);
        if (window.katex == null) {
            // throw new Error('Formula module requires KaTeX.');
        }

        this.handleDrop = this.handleDrop.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        // listen for drop and paste events
        this.quill.root.addEventListener('drop', this.handleDrop, false);
        this.quill.root.addEventListener('paste', this.handlePaste, false);

        debug.log("拖动图片到编辑区<34214399@qq.com>");
    }

    handleDrop(evt) {
        evt.preventDefault();
        if (evt.dataTransfer && evt.dataTransfer.files && evt.dataTransfer.files.length) {
            if (document.caretRangeFromPoint) {
                const selection = document.getSelection();
                const range = document.caretRangeFromPoint(evt.clientX, evt.clientY);
                if (selection && range) {
                    selection.setBaseAndExtent(range.startContainer, range.startOffset, range.startContainer, range.startOffset);
                }
            }
            this.readFiles(evt.dataTransfer.files, this.insert.bind(this));
        }
        //
    }

    handlePaste(evt) {
        if (evt.clipboardData && evt.clipboardData.items && evt.clipboardData.items.length) {

            this.readFiles(evt.clipboardData.items, (dataUrl) => {
                const selection = this.quill.getSelection();
                if (selection) {
                    // we must be in a browser that supports pasting (like Firefox)
                    // so it has already been placed into the editor
                } else {
                    // otherwise we wait until after the paste when this.quill.getSelection()
                    // will return a valid index
                    setTimeout(() => this.insert(dataUrl), 0);
                }
            });
        }
    }

    insert(dataUrl) {
        // 这里把从本地的图片文件内容插入到编辑区
        const index = (this.quill.getSelection() || {}).index || this.quill.getLength();
        this.quill.insertEmbed(index, 'image', dataUrl, 'user');
    }

    readFiles(files, callback) {
        // check each file for an image
        [].forEach.call(files, (file) => {
            if (!file.type.match(/^image\/(gif|jpe?g|a?png|svg|webp|bmp|vnd\.microsoft\.icon)/i)) {
                // file is not an image
                // Note that some file formats such as psd start with image/* but are not readable
                return;
            }
            // set up file reader
            const reader = new FileReader();
            reader.onload = (evt) => {
                callback(evt.target.result);
            };
            // read the clipboard item or file
            const blob = file.getAsFile ? file.getAsFile() : file;
            if (blob instanceof Blob) {
                reader.readAsDataURL(blob);
            }
        });
    }
}

export {
    Imgupload as
    default
}
