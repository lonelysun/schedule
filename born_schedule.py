# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#
##############################################################################

from __future__ import division
from openerp import fields,models,api
import logging

_logger = logging.getLogger(__name__)

#班次表(copy from orign)
class born_schedule_shift(models.Model):
    _name = "born.schedule.shift"
    _description = "born.schedule.shift"

    #数据字段定义
    name = fields.Char(u'班次',required=True)
    type = fields.Selection([('work',u'工作'),
                              ('rest',u'休息')],
                             u'类型')
    start_time = fields.Selection([(0, '0:00'), (1, '0:30'), (2, '1:00'), (3, '1:30'),
                                   (4, '2:00'), (5, '2:30'), (6, '3:00'), (7, '3:30'),
                                   (8, '4:00'), (9, '4:30'), (10, '5:00'), (11, '5:30'),
                                   (12, '6:00'), (13, '6:30'), (14, '7:00'), (15, '7:30'),
                                   (16, '8:00'), (17, '8:30'), (18, '9:00'), (19, '9:30'),
                                   (20, '10:00'), (21, '10:30'), (22, '11:00'), (23, '11:30'),
                                   (24, '12:00'), (25, '12:30'), (26, '13:00'), (27, '13:30'),
                                   (28, '14:00'), (29, '14:30'), (30, '15:00'), (31, '15:30'),
                                   (32, '16:00'), (33, '16:30'), (34, '17:00'), (35, '17:30'),
                                   (36, '18:00'), (37, '18:30'), (38, '19:00'), (39, '19:30'),
                                   (40, '20:00'), (41, '20:30'), (42, '21:00'), (43, '21:30'),
                                   (44, '22:00'), (45, '22:30'), (46, '23:00'), (47, '23:30')
                                   ],u'上班时间',required=True)
    end_time = fields.Selection([(0, '0:00'), (1, '0:30'), (2, '1:00'), (3, '1:30'),
                                   (4, '2:00'), (5, '2:30'), (6, '3:00'), (7, '3:30'),
                                   (8, '4:00'), (9, '4:30'), (10, '5:00'), (11, '5:30'),
                                   (12, '6:00'), (13, '6:30'), (14, '7:00'), (15, '7:30'),
                                   (16, '8:00'), (17, '8:30'), (18, '9:00'), (19, '9:30'),
                                   (20, '10:00'), (21, '10:30'), (22, '11:00'), (23, '11:30'),
                                   (24, '12:00'), (25, '12:30'), (26, '13:00'), (27, '13:30'),
                                   (28, '14:00'), (29, '14:30'), (30, '15:00'), (31, '15:30'),
                                   (32, '16:00'), (33, '16:30'), (34, '17:00'), (35, '17:30'),
                                   (36, '18:00'), (37, '18:30'), (38, '19:00'), (39, '19:30'),
                                   (40, '20:00'), (41, '20:30'), (42, '21:00'), (43, '21:30'),
                                   (44, '22:00'), (45, '22:30'), (46, '23:00'), (47, '23:30')
                                   ],u'下班时间',required=True)
    working_time = fields.Float(compute='_end_time_counter',string=u'时间')

    #计算上班时长
    @api.onchange('start_time','end_time')
    def _end_time_counter(self):
        for record in self:
            if record.end_time and record.start_time:
                record.working_time = (record.end_time - record.start_time)/2
                if record.working_time < 0:
                    record.working_time += 24
        return

class born_schedule(models.Model):
    _name = "born.schedule"
    _description = "born.schedule"

    name = fields.Char(u'编号',default='排班记录')
    employee_id=fields.Many2one('hr.employee',u'员工',required=True)
    shift_id=fields.Many2many('born.schedule.shift',string=u'班次')
    date=fields.Date(u'日期',required=True)
    working_time_amount = fields.Float(compile='_get_amount',string=u'工作时间')

    @api.onchange('shift_id')
    def _get_amount(self):
        for record in self:
            for shift in record.shift_id:
                if shift.type == 'work':
                    record.working_time_amount += shift.working_time
        return




