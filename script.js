$(document).ready(function () {
	// Заполняем таблицу
	fillTableFromLocStorage();

	$('#add-book-form').validate({
		// Сброс состояния полей ввода
		init: function() { $(this).children('input').css({'background-color' : '#fff'}) },

		success: function(event) {
			event.preventDefault();
			var newBook = $(this).serializeFormToObject();

			$('#books-table').append($('#tableRow').tmpl({
				'author': newBook.author,
				'title': newBook.title
			}));

			$(this)[0].reset();

			// Режим редактирования
			var editingRow = $('#books-table [data-id=row].warning').children();

			if (editingRow.length) {
				$('[data-id=submit]', this).removeClass('btn-warning').html('Add');
				localStorage.removeItem([editingRow[0].textContent, '<key>', editingRow[1].textContent].join(''));
				editingRow.remove();
			};

			// Запись в локальное хранилище
			try { localStorage.setItem([newBook.author, '<key>', newBook.title].join(''), JSON.stringify(newBook)) }
			catch (exception) { (exception == QUOTA_EXCEEDED_ERR) && alert('Local storage is full! Quota exceeded!') }
		},
		fail: function(invalids) {
			$.each(invalids, function(index, invalid) {
				// Кастомное отображение ошибки валидации (В bootstrap не нашёлся хороший аналог)
				$(invalid).val('').css({'background-color' : 'rgb(255, 113, 113)'});
			});
		}
	});

	// Обработчик нажатия на кнопку отмены
	$('#add-book-form [data-id=cancel]').click(function (event) {
		$(this).siblings('[data-id=submit]').removeClass('btn-warning').html('Add')
			.siblings('input').css({'background-color' : '#fff'});

		$('#books-table [data-id=row]').removeClass('warning');
	});

	// Обработчик нажатия на кнопку редактирования
	$('#books-table').on('click', '[data-id=edit-book]', function (event) {
		var row = $(event.currentTarget).closest('[data-id=row]').children(),
			book = JSON.parse(localStorage.getItem([row[0].textContent, '<key>', row[1].textContent].join('')));

		$('#add-book-form [data-id=author]').val(book.author)
			.siblings('[data-id=publishedYear]').val(book.publishedYear)
			.siblings('[data-id=title]').val(book.title)
			.siblings('[data-id=pages]').val(book.pages);

		$('#add-book-form [data-id=submit]').addClass('btn-warning').html('Apply');

		$(event.currentTarget).closest('[data-id=row]').addClass('warning')
			.siblings().removeClass('warning');
	});

	// Обработчик нажания на кнопку удаления
	$('#books-table').on('click', '[data-id=remove-book]', function (event) {
		var row = $(event.currentTarget).closest('[data-id=row]').children();

		row.remove();
		localStorage.removeItem([row[0].textContent, '<key>', row[1].textContent].join(''));

		$('#add-book-form [data-id=submit]').removeClass('btn-warning').html('Add')
			.siblings('input').css({'background-color' : '#fff'});

		$('#add-book-form')[0].reset();
	});
});

$.fn.serializeFormToObject = function() { return this.serializeArray().reduce(function(obj, el) { obj[el.name] = el.value; return obj }, new Object) };

fillTableFromLocStorage = function() {
	$.each(localStorage, function(key, value) {
		if (key.match('.+\<key\>.+')) {
			var book = JSON.parse(value);
			$('#books-table').append($('#tableRow').tmpl({
				'author': book.author,
				'title': book.title,
			}))
		}
	})

};