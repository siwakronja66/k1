<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

admin_page();
redirect('departments.php');
