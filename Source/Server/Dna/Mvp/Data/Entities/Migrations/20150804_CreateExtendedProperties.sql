--------- Validations table ----------
IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('Validations') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'Integer' 
																														AND [object_id] = OBJECT_ID('Validations')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Validations',
	 @level2type=N'COLUMN',
     @level2name=N'Integer'
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
        "type": "integer",
        "formatText": "",
        "regularExpression": "/^(\\+|-)?\\\\d+$/",
        "errorMessageTemplate": "The %displayName% is not a valid",
        "errorMessage": "Interger is not a valid.",
        "comments": "N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'Validations',
              @level2type=N'COLUMN',
              @level2name=N'Integer'



IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('Validations') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'Date' 
																														AND [object_id] = OBJECT_ID('Validations')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Validations',
	 @level2type=N'COLUMN',
     @level2name=N'Date'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
            "type":"dateTime",
            "formatText": "dd-MM-yyyy",
            "regularExpression":"^(0[1-9]|[12][0-9]|3[01])(-|\/)(0[1-9]|1[012])(-|\/)(17[0-5][0-3]|[\\\\d]{4})(\\s[\\\\d]{1,2}:[\\\\d]{1,2}(\\s)(am|AM|pm|PM)?)?$",
            "errorMessageTemplate":"The %displayName% is not a valid.",
            "errorMessage":"Date Time is not a valid.",
            "comments":"N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'Validations',
              @level2type=N'COLUMN',
              @level2name=N'Date'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('Validations') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'Age' 
																														AND [object_id] = OBJECT_ID('Validations')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Validations',
	 @level2type=N'COLUMN',
     @level2name=N'Age'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
            "type":"integer",
            "formatText": "",
            "regularExpression":"/^(\\+|-)?\\\\d+$/",
            "errorMessageTemplate":"The %displayName% is not a valid.",
            "errorMessage":"Interger is not a valid.",
            "comments":"N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'Validations',
              @level2type=N'COLUMN',
              @level2name=N'Age'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('Validations') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'CreditCard' 
																														AND [object_id] = OBJECT_ID('Validations')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Validations',
	 @level2type=N'COLUMN',
     @level2name=N'CreditCard'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
            "type":"creditcard",
            "formatText": "",
            "regularExpression":"/^(?:40-9]{12}(?:0-9]{3})?|51-5]0-9]{14}|6(?:011|50-9]0-9])0-9]{12}|347]0-9]{13}|3(?:00-5]|68]0-9])0-9]{11}|(?:2131|1800|35\\\\d{3})\\\\d{11})$/",
            "errorMessageTemplate":"The %displayName% is not a valid.",
            "errorMessage":"Credit Card is not a valid.",
            "comments":"N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'Validations',
              @level2type=N'COLUMN',
              @level2name=N'CreditCard'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('Validations') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'Email' 
																														AND [object_id] = OBJECT_ID('Validations')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Validations',
	 @level2type=N'COLUMN',
     @level2name=N'Email'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
            "type":"email",
            "formatText": "",
            "regularExpression": "/^([a-z0-9_\\.-]+)@([\\\\da-z\\.-]+)\\.([a-z\\.]{2,6})$/",
            "errorMessageTemplate":"The %displayName% is not a valid.",
            "errorMessage":"Email is not a valid.",
            "comments":"N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'Validations',
              @level2type=N'COLUMN',
              @level2name=N'Email'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('Validations') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'Phone' 
																														AND [object_id] = OBJECT_ID('Validations')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Validations',
	 @level2type=N'COLUMN',
     @level2name=N'Phone'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
            "type":"phoneNumber",
            "formatText": "",
            "regularExpression":"/\\(\\\\d{3}\\) \\\\d{3}-\\\\d{4}/",
            "errorMessageTemplate":"The %displayName% is not a valid.",
            "errorMessage":"Phone Number is not a valid.",
            "comments":"N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'Validations',
              @level2type=N'COLUMN',
              @level2name=N'Phone'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('Validations') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'Zip' 
																														AND [object_id] = OBJECT_ID('Validations')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Validations',
	 @level2type=N'COLUMN',
     @level2name=N'Zip'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
            "type":"zip",
            "formatText": "",
            "regularExpression":" /^\\\\d{5}(?:-\\s\\\\d{4})?$/",
            "errorMessageTemplate":"The %displayName% is not a valid.",
            "errorMessage":"Zip is not a valid.",
            "comments":"N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'Validations',
              @level2type=N'COLUMN',
              @level2name=N'Zip'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('Validations') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'StartsWithDPT' 
																														AND [object_id] = OBJECT_ID('Validations')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Validations',
	 @level2type=N'COLUMN',
     @level2name=N'StartsWithDPT'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
            "type":"startsWith",
            "formatText": "",
            "regularExpression":"/DPT|dpt/",
            "errorMessageTemplate":"The %displayName% is not a valid.",
            "errorMessage":"Start With is not a valid.",
            "comments":"N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'Validations',
              @level2type=N'COLUMN',
              @level2name=N'StartsWithDPT'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('Validations') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'ContainsDPT' 
																														AND [object_id] = OBJECT_ID('Validations')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Validations',
	 @level2type=N'COLUMN',
     @level2name=N'ContainsDPT'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
            "type":"contains",
            "formatText": "",
            "regularExpression":"/^(DPT|dpt)/",
            "errorMessageTemplate":"The %displayName% is not a valid.",
            "errorMessage":"Contains is not a valid.",
            "comments":"N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'Validations',
              @level2type=N'COLUMN',
              @level2name=N'ContainsDPT'


--------- AllDataTypes table ----------
IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('AllDataTypes') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'Decimal' 
																														AND [object_id] = OBJECT_ID('AllDataTypes')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'AllDataTypes',
	 @level2type=N'COLUMN',
     @level2name=N'Decimal'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
        "type": "decimal",
        "formatText": "",
        "regularExpression": "/^[0-9]{1,18}?$/",
        "errorMessageTemplate": "The %displayName% is not a valid",
        "errorMessage": "Decimal is not a valid.",
        "comments": "N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'AllDataTypes',
              @level2type=N'COLUMN',
              @level2name=N'Decimal'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('AllDataTypes') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'Float' 
																														AND [object_id] = OBJECT_ID('AllDataTypes')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'AllDataTypes',
	 @level2type=N'COLUMN',
     @level2name=N'Float'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
            "type":"float",
            "formatText": "",
            "regularExpression":"/^[-+]?[0-9]+([.][0-9]+)?$/",
            "errorMessageTemplate":"The %displayName% is not a valid.",
            "errorMessage":"Float is not a valid.",
            "comments":"N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'AllDataTypes',
              @level2type=N'COLUMN',
              @level2name=N'Float'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('AllDataTypes') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'Geography' 
																														AND [object_id] = OBJECT_ID('AllDataTypes')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'AllDataTypes',
	 @level2type=N'COLUMN',
     @level2name=N'Geography'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
            "type":"geography",
            "formatText": "",
            "regularExpression":"/^[-+]?[0-9]+([.][0-9]+),[ ]?[-+]?[0-9]+([.][0-9]+)?$/",
            "errorMessageTemplate":"The %displayName% is not a valid.",
            "errorMessage":"Geography is not a valid.",
            "comments":"N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'AllDataTypes',
              @level2type=N'COLUMN',
              @level2name=N'Geography'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('AllDataTypes') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'Money' 
																														AND [object_id] = OBJECT_ID('AllDataTypes')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'AllDataTypes',
	 @level2type=N'COLUMN',
     @level2name=N'Money'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
        "type": "money",
        "formatText": "",
        "regularExpression": "/^[-+]?[0-9]+([.][0-9]+)?$/",
        "errorMessageTemplate": "The %displayName% is not a valid",
        "errorMessage": "Money is not a valid.",
        "comments": "N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'AllDataTypes',
              @level2type=N'COLUMN',
              @level2name=N'Money'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('AllDataTypes') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'SmallMoney' 
																														AND [object_id] = OBJECT_ID('AllDataTypes')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'AllDataTypes',
	 @level2type=N'COLUMN',
     @level2name=N'SmallMoney'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
        "type": "smallmoney",
        "formatText": "",
        "regularExpression": "/^[-+]?[0-9]+([.][0-9]+)?$/",
        "errorMessageTemplate": "The %displayName% is not a valid",
        "errorMessage": "SmallMoney is not a valid.",
        "comments": "N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'AllDataTypes',
              @level2type=N'COLUMN',
              @level2name=N'SmallMoney'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('AllDataTypes') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'Numeric' 
																														AND [object_id] = OBJECT_ID('AllDataTypes')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'AllDataTypes',
	 @level2type=N'COLUMN',
     @level2name=N'Numeric'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
        "type": "numeric",
        "formatText": "",
        "regularExpression": "/^[-+]?[0-9]+([.][0-9]+)?$/",
        "errorMessageTemplate": "The %displayName% is not a valid",
        "errorMessage": "Numeric is not a valid.",
        "comments": "N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'AllDataTypes',
              @level2type=N'COLUMN',
              @level2name=N'Numeric'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('AllDataTypes') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'Real' 
																														AND [object_id] = OBJECT_ID('AllDataTypes')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'AllDataTypes',
	 @level2type=N'COLUMN',
     @level2name=N'Real'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
        "type": "real",
        "formatText": "",
        "regularExpression": "/^[-+]?[0-9]+([.][0-9]+)?$/",
        "errorMessageTemplate": "The %displayName% is not a valid",
        "errorMessage": "Real is not a valid.",
        "comments": "N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'AllDataTypes',
              @level2type=N'COLUMN',
             @level2name=N'Real'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('AllDataTypes') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'SmallDateTime' 
																														AND [object_id] = OBJECT_ID('AllDataTypes')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'AllDataTypes',
	 @level2type=N'COLUMN',
     @level2name=N'SmallDateTime'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
        "type": "smalldatetime",
		"formatText": "dd-MM-yyyy",
		"regularExpression":"/^(0[1-9]|[12][0-9]|3[01])(-|\/)(0[1-9]|1[012])(-|\/)(19|20[0-7][0-9])(\\s[\\\\d]{1,2}:[\\\\d]{1,2}(\\s)(am|AM|pm|PM)?)?$/",
        "errorMessageTemplate": "The %displayName% is not a valid",
        "errorMessage": "SmallDateTime is not a valid.",
        "comments": "N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'AllDataTypes',
              @level2type=N'COLUMN',
              @level2name=N'SmallDateTime'


IF EXISTS (SELECT NULL FROM SYS.EXTENDED_PROPERTIES WHERE [major_id] = OBJECT_ID('AllDataTypes') AND [name] = N'DnaMetaData' 
															AND [minor_id] = (SELECT [column_id] FROM SYS.COLUMNS WHERE [name] = 'TinyInt' 
																														AND [object_id] = OBJECT_ID('AllDataTypes')))
BEGIN
EXEC sys.sp_dropextendedproperty 
     @name  =N'DnaMetaData', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'AllDataTypes',
	 @level2type=N'COLUMN',
     @level2name=N'TinyInt'; 
END

EXEC sys.sp_addextendedproperty
@name=N'DnaMetaData',
@value=N'{
    "validations": [
        {
        "type": "tinyint",
        "formatText": "",
        "regularExpression": "/(^[0-9]$)|(^[1-9][0-9]$)|(^[0-2][0-5][0-5]$)/",
        "errorMessageTemplate": "The %displayName% is not a valid",
        "errorMessage": "TinyInt is not a valid.",
        "comments": "N/A"
        }
    ]
}',
@level0type=N'SCHEMA',
@level0name=N'dbo',
       @level1type=N'TABLE',
       @level1name=N'AllDataTypes',
              @level2type=N'COLUMN',
              @level2name=N'TinyInt'
