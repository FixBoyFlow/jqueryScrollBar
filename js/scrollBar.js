/**
 * Created by xuzek on 2017/12/8.
 */

(function (win, doc, $) {
    function CusScrollBar(options) {
        this._init(options);
    }

//            CusScrollBar.prototype._init = function() {
//                console.log('test');
//            };
    $.extend(CusScrollBar.prototype, {
        _init: function (options) {
            var self = this;
            self.options = {
                scrollDir: 'y', // ��������
                contSelector: '', // ������������ѡ����
                barSelector: '', // ������ѡ����
                sliderSelector: '', // ��������ѡ����
                wheelStep: 10, // ���ֲ���
                tabItemSelector: ".tab-item", // ��ǩѡ����
                tabActiveClass: 'tab-active', // ѡ�б�ǩ����
                anchorSelector: '.anchor', // ê��ѡ����
                correctSelector: '.correct-bot', // У��Ԫ��
                articleSelector: '.scroll-ol' // ����ѡ����
            };
            $.extend(true, self.options, options || {});
            self._initDomEvent();

            return self;
        },
        _initDomEvent: function () {
            var opts = this.options;
            // �������������󣬱�����
            this.$cont = $(opts.contSelector);
            // ������������󣬱�����
            this.$slider = $(opts.sliderSelector);
            // ����������
            this.$bar = opts.barSelector ? $(opts.barSelector) : self.$slider.parent();
            // ��ǩ��
            this.$tabItem = $(opts.tabItemSelector);
            // ê����
            this.$anchor = $(opts.anchorSelector);
            // ����
            this.$article = $(opts.articleSelector);
            // У��Ԫ�ض���
            this.$correct = $(opts.correctSelector);
            // ��ȡ�ĵ�����
            this.$doc = $(doc);

            this._initArticleHeight()
                ._initSliderDragEvent()
                ._initTabEvent()
                ._bindContScroll()
                ._bindMousewheel();
        },
        _initSliderDragEvent: function () {
            var slider = this.$slider,
                sliderEl = slider[0];
            var self = this;
            if (sliderEl) {
                var doc = this.$doc,
                    dragStartPagePosition,
                    dragStartScrollPosition,
                    dragContBarRate;
                function mousemoveHanlder(e) {
                    e.preventDefault();
                    if (dragStartPagePosition == null) {
                        return;
                    }
                    self.scrollTo( dragStartScrollPosition + (e.pageY - dragStartPagePosition)*dragContBarRate);
                }
                slider.on('mousedown',function(e) {
                    e.preventDefault();
                    dragStartPagePosition = e.pageY;
                    dragStartScrollPosition = self.$cont[0].scrollTop;
                    dragContBarRate = self.getMaxScrollPosition()/self.getMaxSliderPosition();
                    doc.on("mousemove.scroll",mousemoveHanlder)
                        .on('mouseup.scroll',function(e) {
                            doc.off('.scroll');
                        })
                })
            }
            return self;
        },
        _initTabEvent: function() {
            var self = this;
            self.$tabItem.on('click',function(e) {
                e.preventDefault();
                var index = $(this).index();
                self.changeTabSelect(index);
                // �Ѿ����������������ݸ߶�
                // + �ƶ�ê�������������ľ���
                self.scrollTo(self.$cont[0].scrollTop + self.getAnchorPosition(index))
            });
            return self;
        },
        _initArticleHeight: function() {
            var self = this,
                lastArticle = self.$article.last();

            var lastArticleHeight = lastArticle.height(),
                contHeight = self.$cont.height();

            if (lastArticleHeight < contHeight) {
                self.$correct[0].style.height = contHeight - lastArticleHeight - self.$anchor.outerHeight() + 'px';
            }
            return self;
        },
        // ��ȡָ��ê�㵽�ϱ߽������ֵ
        getAnchorPosition: function(index) {
            return this.$anchor.eq(index).position().top;
        },
        // ��ȡÿ��ê��λ����Ϣ������
        getAllAnchorPosition: function() {
            var self = this,
                allPositionArr = [];
            for (var i = 0; i < self.$anchor.length; i++) {
                allPositionArr.push(self.$cont[0].scrollTop + self.getAnchorPosition(i));
            }
            return allPositionArr;
        },
        // �л���ǩ��ѡ���¼�
        changeTabSelect: function(index) {
            var self = this,
                active = self.options.tabActiveClass;
            return self.$tabItem.eq(index).addClass(active).siblings().removeClass(active);
        },
        // �������ݵĹ�����ͬ������λ��
        _bindContScroll: function() {
            var self = this;
            self.$cont.on('scroll',function() {
                var sliderEl = self.$slider && self.$slider[0];
                if (sliderEl) {
                    sliderEl.style.top = self.getSliderPosition() + 'px';
                }
            });
            return self;
        },
        // �󶨹����¼�
        _bindMousewheel : function() {
            var self = this;
            self.$cont.on('mousewheel DOMMouseScroll',function(e) {
                e.preventDefault();
                var oEv = e.originalEvent, // ȡ��ԭ���¼�����
                    wheelRange = oEv.wheelDelta?-oEv.wheelDelta/120 : (oEv.detail || 0)/3;
                self.scrollTo(self.$cont[0].scrollTop + wheelRange * self.options.wheelStep);
            });
            return self;
        },
        // ���㻬��ĵ�ǰλ��
        getSliderPosition: function() {
            var self = this,
                maxSliderPosition = self.getMaxSliderPosition();
            return Math.min(maxSliderPosition,maxSliderPosition * self.$cont[0].scrollTop/self.getMaxScrollPosition());
        },
        // ���ݿɹ����ĸ߶�
        getMaxScrollPosition: function() {
            var self = this;
            return Math.max(self.$cont.height(),self.$cont[0].scrollHeight) - self.$cont.height();
        },
        // ������ƶ��ľ���
        getMaxSliderPosition: function() {
            var self = this;
            return self.$bar.height() - self.$slider.height();
        },
        scrollTo: function(positionVal) {
            var self = this;
            var posArr = self.getAllAnchorPosition();
            // ��������λ����tab��ǩ�Ķ�Ӧ
            function getIndex(positionVal) {
                for (var i = posArr.length - 1;i >= 0; i--) {
                    if (positionVal >= posArr[i]) {
                        return i;
                    } else {
                        continue;
                    }
                }
            }
            // ê�������ǩ��ͬ
            if (posArr.length == self.$tabItem.length) {
                self.changeTabSelect(getIndex(positionVal))
            }
            self.$cont.scrollTop(positionVal);
        }
    });
    win.CusScrollBar = CusScrollBar;
})(window, document, jQuery);
new CusScrollBar({
    contSelector: '.scroll-cont', // ����������ѡ����
    barSelector: '.scroll-bar', // ������ѡ����
    sliderSelector: '.scroll-slider' // ��������ѡ����
});
