import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {
  SelectItem, MenuItem, ConfirmationService, MessageService, DialogService,
  DynamicDialogRef, DynamicDialogConfig
} from 'primeng/primeng';
import { GlobalService } from 'src/app/services/global.service';
import { ConstantService } from 'src/app/services/constant.service';
import { TipoNotificacion } from 'src/app/clases/tipoNotificacion.class';


@Component({
  selector: 'app-tipos-notificacion-form',
  templateUrl: './tipos-notificacion-form.component.html',
  styleUrls: ['./tipos-notificacion-form.component.scss']
})
export class TiposNotificacionFormComponent implements OnInit {

  item: TipoNotificacion = new TipoNotificacion( 0, null, true );
  lcActividades: any = [];
  editing: boolean;
  comienzo = new Date();
  fin = new Date();

  constructor(
    public dynamicDialogRef: DynamicDialogRef,
    public dynamicDialogConfig: DynamicDialogConfig,
    private gService: GlobalService,
    private constant: ConstantService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.item = this.dynamicDialogConfig.data;// valida si esta para editar o no
    // tslint:disable-next-line:no-unused-expression
    if (this.item.id !== null) {
      this.buscar(this.item.id);
      this.editing = true;
    }else {
      this.item.activo=true;
    }
  }

  buscar(id) {
    this.gService.getBy(this.constant.servicio, id)
      .subscribe(
        (data: TipoNotificacion) => {
          this.comienzo = new Date('1970-01-01T' );// + data.comienzo);
          this.fin = new Date('1970-01-01T' );// + data.fin);
          this.item = data;    
       },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Verifique', detail: error });
        });
  }

  onSubmit() {
    // inicia spinner
    this.item.id !== null ? this.onUpdate() : this.onCreate();
  }

  onCreate() {
    //this.item.comienzo = this.comienzo.getTime();
    //this.item.fin = this.fin.getTime();
    //console.log(this.item.fin);
    console.log(this.item);
    this.gService.save(this.constant.servicio, this.item)
      .subscribe(
        (data: TipoNotificacion) => {
          this.confirmationService.confirm({
            message:'¿Desea seguir guardando?',
            header: 'Confirmación',
            icon: 'fa fa-info-circle',
            accept: () => {
              this.item = new TipoNotificacion(0, null, true);
             },
             reject: () => {
               //this.messageService.add({ severity: 'info', summary: 'Proceso Cancelado', detail: 'Se canceló la eliminación del registro' });
               this.dynamicDialogRef.close();
             },
           });


          this.messageService.add({ severity: 'info', summary: 'Verifique', detail: 'Registro exitoso' });
          // this.cerrar();
        },
        error => {
          // cierra spinner
          this.messageService.add({ severity: 'error', summary: 'Verifique', detail: error });
        }
      );
  }

  onUpdate() {
    this.gService.update(this.constant.servicio, this.item)
      .subscribe(
        (data: TipoNotificacion) => {
          this.messageService.add({ severity: 'info', summary: 'Verifique', detail: 'Registro exitoso' });
          // this.cerrar();
        },
        error => {
          // cierra spinner
          this.messageService.add({ severity: 'error', summary: 'Verifique', detail: error });
        }
      );
  }

  onClose() {
    // reset formulario
    this.dynamicDialogRef.close('Carro 1');
  }
}
