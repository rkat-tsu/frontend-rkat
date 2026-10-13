<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;

trait PreservesPagination
{
    protected function rememberPaginationQuery(Request $request, string $key): void
    {
        $request->session()->put("pagination_queries.{$key}", $request->query());
    }

    protected function redirectToPaginatedList(Request $request, string $key, string $routeName)
    {
        $query = $request->session()->get("pagination_queries.{$key}", []);

        return redirect()->route($routeName, $query);
    }
}
