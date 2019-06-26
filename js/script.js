const defaultToken = {
    token: '',
    removable: true
};

let vue = new Vue({
    el: '#root',
    data: {
        tokens: [{
            ...defaultToken,
            removable: false
        }],
        post_address: '',
        interval: '',
        current_interval: null,
        comment_text: '',
        working: false,
        debug: false
    },
    methods: {
        deleteToken(id) {
            this.tokens.splice(id, 1);
        },
        addToken() {
            this.tokens.push(defaultToken);
        },
        startSpam() {
            let tokens = this.tokens.map(token => token.token),
                address = this.post_address,
                {
                    groups: {
                        group_id,
                        post_id
                    }
                } = address.match(/^http?s:\/\/(?:www)?vk\.com\/.*?wall(?<group_id>-?\d+?)_(?<post_id>\d+).*$/) ||
                {
                    groups: {
                        group_id: undefined,
                        post_id: undefined
                    }
                },
                interval = this.interval,
                comment_text = encodeURIComponent(this.comment_text),
                comment_count = 0;
            if (!group_id || !post_id) {
                console.error('Неверный URL поста!');
            } else if (tokens.filter(token => token.length < 84 || token.length > 86)[0]) {
                console.error('Неверная длина одного из токенов!');
            } else if (!this.interval.match(/^\d+$/)) {
                console.error('Неверный интервал (пишите в мс)!');
            } else {
                console.clear();
                this.working = true;
                let repeat = 0;
                this.current_interval = setInterval(() => {
                    for (index in tokens) {
                        let i = index;
                        setTimeout(() => {
                            let component = encodeURIComponent(`https://api.vk.com/method/wall.createComment?owner_id=${group_id}&post_id=${post_id}&from_group=1&message=${comment_text}&access_token=${tokens[i]}&v=5.95`),
                                url = `https://api.codetabs.com/v1/proxy?quest=${component}`;
                            fetch(url);
                            if (this.debug) {
                                console.log({
                                    url,
                                    timeout: interval / tokens.length * i,
                                    full_timeout: repeat * interval + interval / tokens.length * i
                                })
                            }
                        }, interval / tokens.length * i);
                    }
                    repeat++;
                }, interval);
            };
        },
        stopSpam() {
            clearInterval(this.current_interval);
            this.working = false;
        }
    },
})