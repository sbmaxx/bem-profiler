/* global console */
(function() {

    if (window.location.toString().indexOf('bem-profiler') === -1) {
        return false;
    }

    var data,
        timeout;

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
    function getDelta(fn, ctx, args) {
        var start = window.performance.now();
        fn.apply(ctx, args);
        return window.performance.now() - start;
    }

    window.performance = (window.performance || {
        offset: Date.now(),
        now: function now(){
            return Date.now() - this.offset;
        }
    });

    BEM.decl('i-bem', {}, {

        // публичный помощник для получения свойства из замыкания
        profiler: function(block) {
            var output = (block && data[block]) ? data[block] : data;

            // после window.perfomance у нас получается много знаков после запятой
            // оставляем два — получается строка, которую потом приводим снова к числу,
            // чтобы табличка была чище (без кавычек)
            Object.keys(output).forEach(function(block) {
                Object.keys(output[block]).forEach(function(field) {
                    output[block][field] = parseFloat(output[block][field].toFixed(2));
                });
            });

            return output;
        }

    });

    BEM.decl('i-bem__dom', {

        // расширяем метод, который непосредственно проставляет
        // блокам модификатор js_inited
        // внутренние методы инициализации (парсинг параметров и прочее) опускаем
        __constructor: function() {

            var syncTime = getDelta(this.__base, this, arguments);

            // синхронно вызываем добавленные блоком методы через afterCurrentEvent,
            // если этого не делать, то время выполнения блока будет нечестным
            var asyncTime = getDelta(this.__self._runAfterCurrentEventFns, this.__self, arguments);

            var delta = syncTime + asyncTime;

            // имя блока доступно только после вызова конструктора по умолчанию
            var block = this.__self.getName();

            if (typeof data[block] === 'undefined') {
                data[block] = {
                    time: 0,
                    sync: 0,
                    async: 0
                };
            }

            // по факту это время инициализации блока и его внутренних методов
            data[block].time += delta;
            data[block].sync += syncTime;
            data[block].async += asyncTime;

            return this;

        }

    }, {

        init: function() {
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
