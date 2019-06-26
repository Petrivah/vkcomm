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
        debug: false,
        last_response: {}
    },
    methods: {
        deleteToken(id) {
            this.tokens.splice(id, 1);
        },
        addToken() {
            this.tokens.push(defaultToken);
        },
        startSpam() {
            console.log('Спам начат!');
            let tokens = this.tokens.map(token => token.token),
                address = this.post_address,
                {
                    groups: {
                        group_id,
                        post_id
                    }
                } = address.match(/^http?s:\/\/(?:www)?vk\.com\/.*?wall(?<group_id>-?\d+?)_(?<post_id>\d+).*$/) || {
                    groups: {
                        group_id: undefined,
                        post_id: undefined
                    }
                },
                interval = this.interval,
                comment_text = encodeURIComponent(this.comment_text),
                repeat = 0;
            if (!group_id || !post_id) {
                console.error('Неверный URL поста!',
                    `Ваш URL: ${address}`);
            } else if (tokens.filter(token => token.length < 84 || token.length > 86)[0]) {
                console.error('Неверная длина одного из токенов!',
                    `Ваши токены: ${tokens.join(', ')}`);
            } else if (!this.interval.match(/^\d+$/)) {
                console.error('Неверный интервал (пишите в мс)!',
                    `Ваш интервал: ${interval}`);
            } else {
                console.clear();
                this.working = true;
                this.current_interval = setInterval(() => {
                    for (index in tokens) {
                        let i = index;
                        setTimeout(() => {
                            let component = encodeURIComponent(`https://api.vk.com/method/wall.createComment?owner_id=${group_id}&post_id=${post_id}&from_group=1&message=${comment_text}&access_token=${tokens[i]}&v=5.95`),
                                url = `https://api.codetabs.com/v1/proxy?quest=${component}`;
                            fetch(url).then(r => r.json()).then(json => {
                                this.last_response = JSON.stringify(json.response)
                            });
                            if (this.debug) {
                                console.log({
                                    request_url: url,
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
            console.log('Спам остановлен!');
            if (this.debug) console.info(`Последний ответ от ВК: ${this.last_response}`);
            this.working = false;
        }
    },
})