<p align="center">
  <a href="http://quilljs.com/" title="Quill"><img alt="Quill Logo" src="https://quilljs.com/assets/images/logo.svg" width="180"></a>
</p>

# 快速开始就到
	https://github.com/quilljs/quill

# config 
    <script>
    var quil_editor = new Quill('#quill_content', {
    	modules: {
    		toolbar: '#toolbar',
    		ImageDrop: true,
    		imgupload: {
    			url: "http://xx/upload.api.php",
    			cross: true, //axois 跨域配置
    			postdata : {"name":"test"},
    			callfun : function(ret){
    				console.log(ret);

    				return "https://img-xhpfm.zhongguowangshi.com/News/201711/39bfb4533445438cabd6337aed3eea18.jpg@640w_1e_1c_80Q_1x.jpg";
    			}
    		},
    	},
    	theme: 'snow',
    	debug: true,
    });
	</script>