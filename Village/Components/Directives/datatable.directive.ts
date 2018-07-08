namespace Directives {
  export class NgDatatableDirective implements ng.IDirective {
    static $inject = ['$timeout'];
    constructor(private readonly $timeout: ng.ITimeoutService) {}
    restrict = 'A';
    scope = {
      columnSearch: '=',
      selectSearch: '=',
      buttons: '='
    };
    link = (scope, element, attrs): void => {
      this.datatable = $(element).DataTable({
        buttons: scope.buttons ? ['print', 'copy', 'excel'] : [],
        order: [[0, 'asc']],
        lengthChange: !scope.buttons,
        lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],
        pageLength: 10,
        processing: false,
        serverSide: false,
        searching: true,
        language: {
          paginate: {
            previous: '<span class="icon icon-angle-left"></span>',
            next: '<span class="icon icon-angle-right"></span>',
            first: '<span class="icon icon-angle-double-left"></span>',
            last: '<span class="icon icon-angle-double-right"></span>'
          },
          search: '',
          searchPlaceholder: 'Search...'
        },
        searchDelay: 300,
        pagingType: 'full_numbers'
      });
      if (scope.selectSearch === true) {
        this.selectSearching(element);
      } else if (scope.columnSearch === true) {
        this.columnSearching(element);
      }
      if (scope.buttons === true) {
        this.addButtons(element);
      }
    };
    private datatable: DataTables.Api;
    private datatableFn: DataTables.StaticFunctions = $.fn.dataTable;
    private tableId: string = Guid.short();
    private columnSearching = (element): void => {
      const arr = <Array<JQLite>>element.find('tfoot').find('th');
      for (let index = 0; index < arr.length; index++) {
        const el = $(arr[index]);
        el.html(`<input class="form-control input-sm" type="text" placeholder="Search ${el.text()}..." />`);
      }
      this.datatable.columns().every(function() {
        const column: DataTables.ColumnMethods = this;
        $('input', this.footer()).on('keyup change', function(element) {
          const searchVal = $(element.target).val();
          if (searchVal && column.search() !== searchVal) {
            column.search(<string>searchVal).draw();
          }
        });
      });
    };
    private selectSearching = (element): void => {
      const id = this.tableId;
      this.datatable.columns().every(function() {
        const column = this;
        const header = column.header();
        const select = $(`<select class="select2-${id}"><option value="">${$(header).text()}</option></select>`)
          .appendTo($(column.footer()).empty())
          .on('change', function(element) {
            var val = $.fn.dataTable.util.escapeRegex(<string>$(element.target).val());
            column.search(val ? `^${val}$` : ``, true, false).draw();
          });
        column
          .data()
          .unique()
          .sort()
          .each(function(d, j) {
            select.append(`<option value="${d}">${d}</option>`);
          });
      });
      $(`.select2-${id}`).select2();
    };
    private addButtons = (element): void => {
      $.extend(true, this.datatableFn.Buttons.defaults, {
        dom: {
          button: {
            className: 'btn btn-outline-primary btn-sm'
          }
        }
      });
      this.datatable
        .buttons()
        .container()
        .appendTo(
          $(element)
            .offsetParent()
            .parent()
            .parent()
            .find('.col-sm-6:eq(0)')
        );
    };
  }
  export var ngDatatableDirectiveFactory: ng.IDirectiveFactory = ($timeout: ng.ITimeoutService): ng.IDirective => {
    return new NgDatatableDirective($timeout);
  };
  ngDatatableDirectiveFactory.$inject = ['$timeout'];
}
