<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Actions\Master\CreateIndustryAction;
use App\Actions\Master\DeleteIndustryAction;
use App\Actions\Master\UpdateIndustryAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StoreIndustryRequest;
use App\Http\Requests\Master\UpdateIndustryRequest;
use App\Models\Industry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class IndustryController extends Controller
{
    /**
     * Display a listing of the industries.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Industry::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->query('status'); // 'all', 'active', 'inactive'

        $industries = Industry::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($q) use ($search): void {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%");
                });
            })
            ->when($status === 'active', fn ($q) => $q->where('is_active', true))
            ->when($status === 'inactive', fn ($q) => $q->where('is_active', false))
            ->withCount('pklApplications')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/industries/index', [
            'industries' => $industries,
            'filters' => [
                'search' => $search,
                'status' => $status ?? 'all',
            ],
        ]);
    }

    /**
     * Store a newly created industry in storage.
     */
    public function store(StoreIndustryRequest $request, CreateIndustryAction $action): RedirectResponse
    {
        $action->execute($request->validated());

        return redirect()->route('master.industries.index')
            ->with('success', 'Data DUDI/Industri mitra berhasil ditambahkan.');
    }

    /**
     * Update the specified industry in storage.
     */
    public function update(
        UpdateIndustryRequest $request,
        Industry $industry,
        UpdateIndustryAction $action
    ): RedirectResponse {
        $action->execute($industry, $request->validated());

        return redirect()->route('master.industries.index')
            ->with('success', 'Data DUDI/Industri mitra berhasil diperbarui.');
    }

    /**
     * Remove the specified industry from storage.
     */
    public function destroy(Industry $industry, DeleteIndustryAction $action): RedirectResponse
    {
        Gate::authorize('delete', $industry);

        $action->execute($industry);

        return redirect()->route('master.industries.index')
            ->with('success', 'Data DUDI/Industri mitra berhasil dihapus.');
    }
}
