# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution

#
##############################################################################


{
    'name': '班次管理',
    'version': '0.0.1',
    'category': 'BORN',
    'sequence': '9',
    'description': """班次管理""",
    'summary': u'班次管理',

    'author': 'BORN',
    'website': 'https://www.wevip.com/',
    'depends': ['base', 'hr'],
    'data': [
        'born_schedule.xml',
        'security/ir.model.access.csv'
    ],
    'installable': True,
    'auto_install': False,
    'application': True,
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
