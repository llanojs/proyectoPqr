import { Component, OnInit } from '@angular/core';
import {
  SelectItem, MenuItem, ConfirmationService, MessageService, DialogService,
  DynamicDialogRef, DynamicDialogConfig
} from 'primeng/primeng';
import { Router } from '@angular/router';
import { EventosService } from 'src/app/services/eventos.service';
import { ConstantService } from 'src/app/services/constant.service';
import { Suscriptores } from 'src/app/clases/suscriptores.class';
import { SuscriptoresFormComponent } from '../suscriptores-form/suscriptores-form.component';
import { DashboardComponent } from '../../share/dashboard/dashboard.component';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-suscriptores-list',
  templateUrl: './suscriptores-list.component.html',
  styleUrls: ['./suscriptores-list.component.scss']
})
export class SuscriptoresListComponent implements OnInit {

  lcHeaders: { field: string; header: string; width: string; }[]; // cabecera de la tabla se le pueden poner mas configuraciones
  lcFiltroConsulta: SelectItem[];
  lcFiltroStd: SelectItem[];
  lcSelectedFiltro: object; // = {label: '', value: ''};
  lcSelectedFiltroStd: object;
  lcListItems: Suscriptores[] = [];
  // lcBreadcrumbItems: MenuItem[];
  // lcHome: MenuItem;
  lcConsulta = ''; // input de la consulta
  lcSelectedRow: Suscriptores = null; // Cuando uno se para en un fila de la tabla
  /** lcUsuarioSelect contiene todo el objeto seleccionado */
  lcUsuarioSelect: object = {};

  lcFiltros = { f: [], v: [], l: [] }; // Se almacenan los datos con los que se va a consultar en este objeto

  constructor(
    private router: Router,
    private messageService: MessageService, // mensajes emergentes, prime
    private confirmationService: ConfirmationService, // otro dialogo de servicio que tiene si y no, prime
    private gService: GlobalService,
    private eventos: EventosService,
    private constant: ConstantService,
    public ref: DynamicDialogRef,
    public dialogService: DialogService,
    public dashboard: DashboardComponent
  ) { }

  ngOnInit() {
    this.lcHeaders = [
      { field: 'codigo', header: 'Código', width: '5%' },
      { field: 'nombre', header: 'Nombre', width: '40%' },
     // { field: 'tipo', header: 'Tipo', width: '10%' },
      { field: 'activo', header: 'Activo', width: '5%' }
    ];

    this.lcFiltroConsulta = [
      { label: 'Cédula', value: 'cedula' },
      { label: 'Nombre', value: 'nombre' }
    ];
    this.lcSelectedFiltro = { label: 'Cedula', value: 'cedula' };

    this.lcFiltroStd = [
      { label: 'Todos', value: '' },
      { label: 'Activos', value: 1 },
      { label: 'Inactivos', value: 0 }
    ];
    this.lcSelectedFiltroStd = { label: 'Activos', value: 1 };

    this.eventos.suscriptoresBusqueda.subscribe(() => console.log('emitida la busqueda'));
    this.eventos.suscriptorCreacion.subscribe((data: any) => {
      console.log('creacion emitida');
      this.lcListItems.push(data);
      // console.log('fases', this.fases);
    });


    this.eventos.suscriptorActualizacion.subscribe((data: any) => {
      this.lcListItems = this.lcListItems.map((item: any) => {
        if (item.id === data.id) {
          item = Object.assign({}, item, data);
        }
        return item;
      });
      //  this.tabla.renderRows();
    });

  }

  fnBuscar() {
    this.lcFiltros = {
      // tslint:disable-next-line:no-string-literal
      f: [this.lcSelectedFiltro['value'], 'estado'],
      // tslint:disable-next-line:no-string-literal
      v: [this.lcConsulta, this.lcSelectedFiltroStd['value']],
      l: [true, false]
    };
    this.gService.getAll(this.constant.suscriptores, this.lcFiltros)
      .subscribe(
        (data: Suscriptores[]) => this.lcListItems = data,
        error => {
          this.messageService.add({ severity: 'info', summary: 'Verifique', detail: error });
          /*const snackBarRef = this.snackBar.open(error, 'OK', { duration: 4000 });
          snackBarRef.onAction().subscribe(() => {
            snackBarRef.dismiss();
          });*/
        });
  }

  showSuccess() {
    console.log('Ingreso');
    this.messageService.clear();
    this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Order submitted' });
  }


  fnAsignarRow(row) {
    this.lcSelectedRow = row;
    // this.fnPropiedades();
  }


  fnNuevo() {
    this.fnPruebaDialog(false, null);
  }

  fnPropiedades() {
    if (this.lcSelectedRow !== null) {
      this.fnPruebaDialog(true, this.lcSelectedRow.id);
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: 'info', summary: 'Verifique', detail: 'Seleccione un registro' });
    }
  }

  fnPruebaDialog(editing, id) {
    // tslint:disable-next-line:object-literal-shorthand
    const data = { editing: editing, id: id };
    const dialogConfig = new DynamicDialogConfig();
    dialogConfig.header = 'Suscriptores';
    dialogConfig.width = '45%';
    dialogConfig.closeOnEscape = true;
    dialogConfig.data = data;
    const ref = this.dialogService.open(SuscriptoresFormComponent, dialogConfig);
    ref.onClose.subscribe((result: any) => {
      if (result) {
        console.log(result);
        // this.messageService.add({severity: 'info', summary: 'Car Selected', detail: 'Vin:' + car});
      }
    });
  }

  fnEliminar() {
    if (this.lcSelectedRow != null) {
      this.fnConfirm(this.lcSelectedRow);
    } else {
      this.messageService.add({ severity: 'info', summary: 'Verifique', detail: 'Seleccione un registro' });
    }
  }

  fnConfirm(SelectedRow) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: `<center>¿Está seguro de eliminar el registro <br>
          ${SelectedRow.id} - ${SelectedRow.nombre}?</center>`,
      icon: 'fa fa-trash',
      accept: () => {
        this.gService.delete(this.constant.suscriptor, SelectedRow.id)
          .subscribe(
            (data: Suscriptores) => {
              this.messageService.add({
                severity: 'success', summary: 'Registro Eliminado',
                detail: 'Registro Eliminado Satisfactoriamente'
              });
              this.lcListItems = this.lcListItems.filter((item) => item.id !== SelectedRow.id);
            },
            error => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
            }
          );
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Proceso Cancelado', detail: 'Se canceló la eliminación del registro' });
      },
    });
  }
}
