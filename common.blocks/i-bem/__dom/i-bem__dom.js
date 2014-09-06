/* global console */
(function() {

    if (window.location.toString().indexOf('bem-profiler') === -1) {
        return false;
    }

    var data,
        timeout,
        getDelta;

    // контейнер для отладочной информации
    data = {
        __total: {
            time: 0,
            sync: 0,
            async: 0
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
        profiler: function(block) {
            return (block && data[block]) ? data[block] : data;
        }

    });

    BEM.decl('i-bem__dom', {

        // расширяем метод, который непосредственно проставляет
        // блокам модификатор js_inited
        // внутренние методы инициализации (парсинг параметров и прочее) опускаем
        __constructor: function() {

            var delta,
                sync,
                async,
                block;

            sync = getDelta(this.__base, this, arguments);

            // синхронно вызываем добавленные блоком методы через afterCurrentEvent,
            // если этого не делать, то время выполнения блока будет нечестным
            async = getDelta(this.__self._runAfterCurrentEventFns, this.__self, arguments);

            delta = sync + async;

            // имя блока доступно только после вызова конструктора по умолчанию
            block = this.__self.getName();

            if (typeof data[block] === 'undefined') {
                data[block] = {
                    time: 0,
                    sync: 0,
                    async: 0
                };
            }

            // по факту это время инициализации блока и его внутренних методов
            data[block].time += delta;
            data[block].sync += sync;
            data[block].async += async;

            return this;

        }

    }, {

        init: function() {
            data.__total.time += getDelta(this.__base, this, arguments);
            data.__total.sync = 0;
            // по идее, здесь уже не должно быть ничего асинхронного,
            // т.к. мы форсируем вызов afterCurrentEvent во время инициализации каждого блока
            data.__total.async += getDelta(this._runAfterCurrentEventFns, this, arguments);
        },

        asyncInit: function() {
            data.__total.time += getDelta(this.__base, this, arguments);
            data.__total.sync = 0;
            // по идее, здесь уже не должно быть ничего асинхронного,
            // т.к. мы форсируем вызов afterCurrentEvent во время инициализации каждого блока
            data.__total.async += getDelta(this._runAfterCurrentEventFns, this, arguments);
        }

    });

    $(function() {
        typeof console !== 'undefined' && setTimeout(function() {
            console.table(BEM.profiler());
            console.log(BEM.profiler());
        }, timeout);
    });

}());
