import django.core.validators
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calculadora', '0002_conversaomedicamento'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dosereferencia',
            name='dose_mg_por_kg',
            field=models.DecimalField(
                decimal_places=6,
                help_text='Dose em mg por kg (ou mg/kg/h para infusões contínuas).',
                max_digits=12,
                validators=[django.core.validators.MinValueValidator(Decimal('0.000001'))],
            ),
        ),
    ]
