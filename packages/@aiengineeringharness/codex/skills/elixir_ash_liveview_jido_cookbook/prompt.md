# The stack cookbook

The recurring shapes. Copy the shape, then justify any deviation.

## Ash resource (tenancy and a real policy)

```elixir
defmodule App.Accounts.User do
  use Ash.Resource,
    domain: App.Accounts,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "users"
    repo App.Repo
  end

  attributes do
    uuid_primary_key :id
    attribute :email, :ci_string, allow_nil?: false
    attribute :role, :atom, default: :worker, constraints: [one_of: [:worker, :manager, :admin]]
    attribute :tenant_id, :uuid, allow_nil?: false
    timestamps()
  end

  identities do
    identity :unique_email_per_tenant, [:tenant_id, :email]
  end

  relationships do
    belongs_to :tenant, App.Accounts.Tenant, allow_nil?: false
  end

  multitenancy do
    strategy :context
  end

  policies do
    policy action_type(:read) do
      authorize_if expr(tenant_id == ^actor(:tenant_id))
    end
    policy action_type([:create, :update, :destroy]) do
      authorize_if expr(^actor(:role) in [:manager, :admin])
    end
  end

  actions do
    defaults [:read, :destroy]
    create :register do
      accept [:email, :tenant_id]
      change set_attribute(:role, :worker)
    end
    update :update do
      accept [:role]
    end
  end
end
```

## LiveView page

```elixir
defmodule AppWeb.UsersLive do
  use AppWeb, :live_view
  on_mount {AppWeb.UserAuth, :require_auth}

  def mount(_params, _session, socket) do
    tenant = socket.assigns.current_tenant
    {:ok, assign(socket, users: App.Accounts.list_users!(tenant: tenant))}
  end

  def handle_event("save", %{"user" => params}, socket) do
    case App.Accounts.register_user(params, tenant: socket.assigns.current_tenant) do
      {:ok, user} ->
        Phoenix.PubSub.broadcast(App.PubSub, "users", {:created, user})
        {:noreply, assign(socket, users: [user | socket.assigns.users])}
      {:error, changeset} ->
        {:noreply, assign(socket, form: to_form(changeset))}
    end
  end

  def render(assigns) do
    # use assigns.foo, NOT @foo, inside def render(assigns)
    ~H"..."
  end
end
```

## Jido agent and action (Jido 2)

```elixir
defmodule App.Agents.TicketAgent do
  use Jido.Agent,
    name: "ticket_agent",
    state: %{tenant_id: nil},
    signal_routes: [{"ticket.created", App.Actions.ClassifyTicket}]
end

defmodule App.Actions.ClassifyTicket do
  use Jido.Action,
    name: "classify_ticket",
    schema: [ticket_id: [type: :string, required: true]]

  @impl true
  def run(%{ticket_id: id}, _context) do
    {:ok, %{class: :bug}, directives: [%Jido.Directive.Emit{signal: "ticket.classified"}]}
  end
end
```

## Oban worker

```elixir
defmodule App.Workers.DailySnapshot do
  use Oban.Worker, queue: :default, max_attempts: 3

  @impl true
  def perform(%Oban.Job{args: %{"tenant_id" => tenant_id}}) do
    App.Reports.snapshot(tenant: tenant_id)
    :ok
  end
end
```

## Laws

- LiveViews call **domains**, not ad-hoc queries; domains own Ash actions.
- Agent state holds identifiers and small primitives, never records or changesets.
- Oban is the default scheduler; do not invent one.
- Rust lives only behind a benchmark and a thin, well-typed wrapper.
- Policies are 100% tested; `always()` is a placeholder, not a policy.
