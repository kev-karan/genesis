from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calculadora', '0003_alter_dosereferencia_dose_mg_por_kg'),
    ]

    operations = [
        migrations.AlterField(
            model_name='apresentacaomedicamento',
            name='apresentacao',
            field=models.CharField(
                choices=[('ml', 'mL'), ('gotas', 'Gotas'), ('comprimido', 'Comprimido')],
                default='ml',
                help_text='Formato de saída do cálculo.',
                max_length=10,
            ),
        ),
    ]
