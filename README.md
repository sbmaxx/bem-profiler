bem-profiler
============

Очень простой блок, который поможет посчитать время инициализации страницы в разрезе i-bem.js блоков. Это достигается путём оборачивания вызова конструктора блока в функцию, которая считает два отдельных времени:

* работу метода `__constructor`, который по факту включает в себя вызов `onSetMod: { js: function() {} }`;
* работу методов `afterCurrentEvent` вызванных во время инициализации блока.

Блок **не считает** некоторые служебные вызовы функций вроде:

* первоначального поиска блоков с `js`-реализацией по селектору `i-bem`;
* разбора параметров `onclick, data-bem`.

Информация собирается в течение `3000ms` после события `DOMContentLoaded` и выводится в консоль через `console.table, console.log`.

| block | total | time sync | time async | instances |
| ----- |------:|----------:|-----------:|-----------|
| b-page| 300   | 200       | 100        | Array[1]  |
| footer| 30    | 30        | 0          | Array[1]  |
| link  | 4     | 2         | 2          | Array[2]  |

В варианте `console.log` можно посмотреть время инициализации каждого инстанса, проинспектировать его `DOMElement`.

### Установка, подключение и использование

На данный момент предполагается подключение через `bower` и сборка с помощью `enb`, сконфигурированная на подключение уровня переопределения `bem-profiler/common.blocks` только в `development`-режиме.

При этом никто не мешает в качестве временного решения копировать код блока и непосредственно подмешивать в какой-нибудь существующий, делать символическую ссылку на этот уровень подключения, или выносить код в псевдоэлемент `debug` и управлять им через `deps.js`. Мы принимаем PR и пожелаения ;)

**Важно**: подключение != непосредственное выполнение профилирования. Для включения функциональности необходимо открыть страницу с дополнительным параметром `bem-profiler=1`, например:
`http://localhost/index?bem-profiler=1`.

Также есть возможность в любой момент времени в консоли позвать `BEM.__getInitInfo()`, опционально передав параметром имя блока `BEM.__getInitInfo('header')`.
