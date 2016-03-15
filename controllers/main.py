# -*- coding: utf-8 -*-
##############################################################################
#  COMPANY: BORN
#  AUTHOR: KIWI
#  EMAIL: arborous@gmail.com
#  VERSION : 1.0   NEW  2014/07/21
#  UPDATE : NONE
#  Copyright (C) 2011-2014 www.wevip.com All Rights Reserved
##############################################################################

from openerp import SUPERUSER_ID
from openerp import http
from openerp.http import request
from openerp.tools.translate import _
import openerp
import time,datetime
import logging
import json
from mako import exceptions
from mako.lookup import TemplateLookup
import base64
import os
import werkzeug.utils

_logger = logging.getLogger(__name__)

#MAKO
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

#服务APP
# SER_THEME="defaultApp/views"
ser_path = os.path.join(BASE_DIR, "static",)
ser_tmp_path = os.path.join(ser_path, "tmp")
ser_lookup = TemplateLookup(directories=[ser_path],output_encoding='utf-8',module_directory=ser_tmp_path)

#动态切换数据库
def ensure_db(db='MAST',redirect='/except'):
    if not db:
        db = request.params.get('db')
 
    if db and db not in http.db_filter([db]):
        db = None
     
    if not db and request.session.db and http.db_filter([request.session.db]):
        db = request.session.db
         
    if not db:
        werkzeug.exceptions.abort(werkzeug.utils.redirect(redirect, 303))
    request.session.db = db


#获取模版信息
def serve_template(templatename, **kwargs):
    try:
        template = ser_lookup.get_template(templatename)
        return template.render(**kwargs)
    except:
        return exceptions.html_error_template().render()

#服务
class born_manager(http.Controller):
    
    @http.route('/except_manager', type='http', auth="none",)
    def Exception(self, **post):
        return serve_template('except.html')



    # Submit2
    @http.route('/calendar/fullcalendar/angular/submit2', type='http', auth="none",csrf=False)
    def submit2(self, **post):

        print post
        schedule_obj = request.registry.get('born.schedule')

        change_data = json.loads(post.get('data'))
        for each_data in change_data:
            #get action data
            each_employee_id = each_data['employee_id']
            each_status = each_data['status']
            each_start = each_data['start']
            each_shift_id = int(each_data['shiftId'])

            #do action
            #优化选项1: 先处理重复数据,再让数据库处理
            if each_status == 'add':

                record_id = schedule_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',each_employee_id),('date','=',each_start)],context=request.context)

                if record_id:

                    obj = schedule_obj.browse(request.cr, SUPERUSER_ID,record_id,context=request.context)

                    id_list = obj.shift_id.ids

                    id_list.append(each_shift_id)

                    vals = {
                            'employee_id':each_employee_id,
                            'date':each_start,
                            'shift_id':[(6,0,id_list)]
                        }

                    obj.write(vals)
                else:
                    vals = {
                            'employee_id':each_employee_id,
                            'date':each_start,
                            'shift_id':[(4,each_shift_id)]
                        }
                    schedule_obj.create(request.cr, SUPERUSER_ID,vals,context=request.context)

            elif each_status == 'remove':

                record_id = schedule_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',each_employee_id),('date','=',each_start)],context=request.context)

                #待优化,用(2,ID)来处理删除
                obj = schedule_obj.browse(request.cr, SUPERUSER_ID,record_id,context=request.context)

                id_list = obj.shift_id.ids

                id_list.remove(each_shift_id)

                vals = {
                        'employee_id':each_employee_id,
                        'date':each_start,
                        'shift_id':[(6,0,id_list)]
                    }
                obj.write(vals)

        data ={}
        return json.dumps(data,sort_keys=True)




    @http.route('/calendar/fullcalendar/angular/data', type='http', auth="none",crsf=False)
    def get_employee(self):

        # 员工数据
        hr_obj = request.registry.get('hr.employee')
        employee_ids = hr_obj.search(request.cr, SUPERUSER_ID,[],context=request.context)
        employee_list = hr_obj.read(request.cr,SUPERUSER_ID,employee_ids,fields=['name'],context=request.context)

        # 班表数据
        shift_obj = request.registry.get('born.schedule.shift')
        ids = shift_obj.search(request.cr, SUPERUSER_ID,[],context=request.context)

        # shift_list = shift_obj.read(request.cr,SUPERUSER_ID,ids,fields=['name'],context=request.context)

        objs = shift_obj.browse(request.cr, SUPERUSER_ID,ids,context=request.context)
        shift_list =[]
        for each_shift in objs:
            if (each_shift.start_time) % 2 == 0:
                start_time = str(each_shift.start_time / 2) + ':00'
            else:
                start_time = str(each_shift.start_time / 2) + ':30'

            if (each_shift.end_time) % 2 == 0:
                end_time = str(each_shift.end_time / 2) + ':00'
            else:
                end_time = str(each_shift.end_time / 2) + ':30'

            shift_range = start_time + '--' + end_time
            val = {
                'id':each_shift.id,
                'name':each_shift.name,
                'shift_range': shift_range

            }
            shift_list.append(val)

        # 排班数据
        schedule_obj = request.registry.get('born.schedule')
        eventSource_list = []

        for each_employee_id in employee_ids:
            events = []
            schedule_ids = schedule_obj.search(request.cr, SUPERUSER_ID,[('employee_id','=',each_employee_id)],context=request.context)

            if schedule_ids:
                for each_schedule_id in schedule_ids:
                    # shift_id_list = schedule_obj.read(request.cr,SUPERUSER_ID,each_schedule_id,fields=['shift_id'],context=request.context)

                    instance_schedule_obj = schedule_obj.browse(request.cr,SUPERUSER_ID,each_schedule_id,context=request.context)
                    shift_id_list = instance_schedule_obj.shift_id.ids

                    for each_shift_id in shift_id_list:

                        # 这个地方考虑优化,不需要每次都循环查询
                        obj = shift_obj.browse(request.cr,SUPERUSER_ID,each_shift_id,context=request.context)

                        if (obj.start_time) % 2 == 0:
                            start_time = str(obj.start_time / 2) + ':00'
                        else:
                            start_time = str(obj.start_time / 2) + ':30'

                        if (obj.end_time) % 2 == 0:
                            end_time = str(obj.end_time / 2) + ':00'
                        else:
                            end_time = str(obj.end_time / 2) + ':30'

                        new_title = obj.name + ' '+ start_time + '--' + end_time
                        events.append({'title':new_title,
                                        'shiftId':obj.id,
                                        'start':instance_schedule_obj.date,
                                       })
                eventSource_list.append({
                    'employeeId':each_employee_id,
                    'eventSource':{'events':events}
                })
        print eventSource_list
        data = {
            'employee_list':employee_list,
            'shift_list':shift_list,
            'eventSource_list':eventSource_list
        }
        return json.dumps(data,sort_keys=True)



# new try
    @http.route('/calendar', type='http', auth="none",crsf=False)
    def index(self,  **post):

        uid=request.session.uid
        if not uid:
            werkzeug.exceptions.abort(werkzeug.utils.redirect('/except_manager', 303))

        users_obj = request.registry.get('res.users')
        user=users_obj.browse(request.cr, SUPERUSER_ID, uid)

        return serve_template('index.html')
# end new try