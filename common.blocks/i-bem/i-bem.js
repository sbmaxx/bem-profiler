/* global console */
(function() {

    var data,
        timeout,
        getDelta;

    // контейнер для отладочной информации
    data = {
        __total: {
            time: 0,
            timeSync: 0,
            timeAsync: 0,
            instances: 0
        }
    };

    // задежрка для вывода информации в консоль
    timeout = 3000;

    // помощник для подсчёта времени выполнения метода
    getDelta = function(fn, ctx, args) {
        var start = (new Date()).getTime();
        fn.apply(ctx, args);
        return (new Date()).getTime() - start;
    };

    BEM.decl('i-bem', {}, {

        // публичный помощник для получения свойства из замыкания
        __getInitInfo: function(block) {
            return block && data[block] ? data[block] : data;
        }

    });

    BEM.decl('i-bem__dom', {

        // расширяем метод, который непосредственно проставляет
        // блокам модификатор js_inited
        // внутренние методы инициализации (парсинг параметров и прочее) опускаем
        __constructor: function() {

            var delta,
                deltaSync,
                deltaAsync,
                block;

            deltaSync = getDelta(this.__base, this, arguments);

            // синхронно вызываем добавленные блоком методы через afterCurrentEvent,
            // если этого не делать, то время выполнения блока будет нечестным
            deltaAsync = getDelta(this.__self._runAfterCurrentEventFns, this.__self, arguments);

            delta = deltaSync + deltaAsync;

            // имя блока доступно только после вызова конструктора по умолчанию
            block = this.__self.getName();

            if (typeof data[block] === 'undefined') {
                data[block] = {
                    time: 0,
                    timeSync: 0,
                    timeAsync: 0,
                    instances: []
                };
            }

            // по факту это время инициализации блока и его внутренних методов
            data[block].time += delta;
            data[block].timeSync += deltaSync;
            data[block].timeAsync += deltaAsync;

            data[block].instances.push({
                time: delta,
                timeSync: deltaSync,
                timeAsync: deltaAsync,
                params: this.params,
                domElem: this.domElem
            });

            return this;

        }

    }, {

        asyncInit: function() {
            data.__total.time += getDelta(this.__base, this, arguments);
            data.__total.timeSync = 0;
            // по идее, здесь уже не должно быть ничего асинхронного,
            // т.к. мы форсируем вызов afterCurrentEvent во время инициализации каждого блока
            data.__total.timeAsync += getDelta(this._runAfterCurrentEventFns, this, arguments);
        }

    });

    $(function() {
        typeof console !== 'undefined' && setTimeout(function() {
            typeof console.table === 'function' && console.table(BEM.__getInitInfo());
            typeof console.log === 'function' && console.log(BEM.__getInitInfo());
        }, timeout);
    });

}());
