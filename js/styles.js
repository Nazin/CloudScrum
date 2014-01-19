define([], function() {

    var defaultCellStyles = {
        font: {
            color: 'FF404040',
            size: 10
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'FFFFFFFF'
        },
        border: {
            bottom: {color: 'FFFFFFFF', style: 'thin'},
            top: {color: 'FFFFFFFF', style: 'thin'},
            left: {color: 'FFFFFFFF', style: 'thin'},
            right: {color: 'FFFFFFFF', style: 'thin'}
        }
    }, defaultRightCellStyles = {
        font: {
            color: 'FF404040',
            size: 10
        },
        alignment: {
            horizontal: 'right'
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'FFFFFFFF'
        },
        border: {
            bottom: {color: 'FFFFFFFF', style: 'thin'},
            top: {color: 'FFFFFFFF', style: 'thin'},
            left: {color: 'FFFFFFFF', style: 'thin'},
            right: {color: 'FFFFFFFF', style: 'thin'}
        }
    }, taskDefaultCellStyles = {
        font: {
            color: 'FF999999',
            size: 9
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'FFFFFFFF'
        },
        border: {
            bottom: {color: 'FFFFFFFF', style: 'thin'},
            top: {color: 'FFFFFFFF', style: 'thin'},
            left: {color: 'FFFFFFFF', style: 'thin'},
            right: {color: 'FFFFFFFF', style: 'thin'}
        }
    }, taskOddCellStyles = {
        font: {
            color: 'FF999999',
            size: 9
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'FFF0F9F9'
        },
        border: {
            bottom: {color: 'FFF0F9F9', style: 'thin'},
            top: {color: 'FFF0F9F9', style: 'thin'},
            left: {color: 'FFF0F9F9', style: 'thin'},
            right: {color: 'FFF0F9F9', style: 'thin'}
        }
    }, oddCellStyles = {
        font: {
            color: 'FF404040',
            size: 10
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'FFF0F9F9'
        },
        border: {
            bottom: {color: 'FFF0F9F9', style: 'thin'},
            top: {color: 'FFF0F9F9', style: 'thin'},
            left: {color: 'FFF0F9F9', style: 'thin'},
            right: {color: 'FFF0F9F9', style: 'thin'}
        }
    }, oddBoldCellStyles = {
        font: {
            bold: true,
            color: 'FF404040',
            size: 10
        },
        alignment: {
            horizontal: 'left'
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'FFF0F9F9'
        },
        border: {
            bottom: {color: 'FFF0F9F9', style: 'thin'},
            top: {color: 'FFF0F9F9', style: 'thin'},
            left: {color: 'FFF0F9F9', style: 'thin'},
            right: {color: 'FFF0F9F9', style: 'thin'}
        }
    }, headerCellStyles = {
        font: {
            bold: true,
            color: 'FFFFFFFF',
            size: 11
        },
        alignment: {
            horizontal: 'center'
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'FF404040'
        },
        border: {
            bottom: {color: 'FF404040', style: 'thin'},
            top: {color: 'FF404040', style: 'thin'},
            left: {color: 'FF404040', style: 'thin'},
            right: {color: 'FF404040', style: 'thin'}
        }
    }, titleStyles = {
        font: {
            color: 'FF00AFDB',
            size: 24,
            family: 'Georgia'
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'FFFFFFFF'
        },
        border: {
            bottom: {color: 'FFFFFFFF', style: 'thin'},
            top: {color: 'FFFFFFFF', style: 'thin'},
            left: {color: 'FFFFFFFF', style: 'thin'},
            right: {color: 'FFFFFFFF', style: 'thin'}
        }
    };

    return function(workbook) {

        var stylesheet = workbook.getStyleSheet();

        return {
            title: stylesheet.createFormat(titleStyles),
            header: stylesheet.createFormat(headerCellStyles),
            oddCell: stylesheet.createFormat(oddCellStyles),
            oddBoldCell: stylesheet.createFormat(oddBoldCellStyles),
            defaultCell: stylesheet.createFormat(defaultCellStyles),
            defaultRightCell: stylesheet.createFormat(defaultRightCellStyles),
            taskOddCell: stylesheet.createFormat(taskOddCellStyles),
            taskDefaultCell: stylesheet.createFormat(taskDefaultCellStyles)
        };
    }
});