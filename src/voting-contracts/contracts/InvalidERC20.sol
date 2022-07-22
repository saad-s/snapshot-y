// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.15;

contract InvalidERC20 {
    address public constant ZERO_ADDRESS = address(0);
    string private _name;
    string private _symbol;
    uint256 private _decimals;
    uint256 private _totalSupply;
    uint256 private _consumedSupply;
    address private _owner;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Mint(address indexed recipient, uint256 amount);
    event Burn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == _owner, "Only owner can call this function");
        _;
    }

    modifier checkBalance(address _sender, uint256 _amount) {
        require(_balances[_sender] >= _amount, "Insufficient Balance");
        _;
    }

    modifier checkSender(address _sender) {
        require(_sender == msg.sender, "Invalid Sender");
        _;
    }

    modifier checkZeroAddress(address _account) {
        require(
            _account != ZERO_ADDRESS,
            "Operation with zero address not allowed"
        );
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 decimals_,
        uint256 supply_,
        address owner_
    ) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        _totalSupply = supply_;
        _owner = owner_;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint256) {
        return _decimals;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    // function balanceOf(address owner_) public view returns (uint256) {
    //     return _balances[owner_];
    // }

    function allowance(address owner_, address _spender)
        public
        view
        returns (uint256)
    {
        return _allowances[owner_][_spender];
    }

    function increaseAllowance(
        address owner_,
        address _spender,
        uint256 _increment
    ) public checkSender(owner_) returns (bool) {
        _allowances[_owner][_spender] += _increment;
        return true;
    }

    function decreaseAllowance(
        address owner_,
        address _spender,
        uint256 _decrement
    ) public checkSender(owner_) returns (bool) {
        _allowances[_owner][_spender] -= _decrement;
        return true;
    }

    function transfer(address _recipient, uint256 _amount)
        public
        returns (bool)
    {
        return _transfer(msg.sender, _recipient, _amount);
    }

    function transferFrom(
        address _sender,
        address _recipient,
        uint256 _amount
    ) public checkSender(_sender) returns (bool) {
        return _transfer(msg.sender, _recipient, _amount);
    }

    function approve(address _spender, uint256 _amount) public returns (bool) {
        require(_balances[msg.sender] > 0, "Unauthorized User");
        _allowances[msg.sender][_spender] = _amount;
        return true;
    }

    function mint(address _recipient, uint256 _amount)
        public
        onlyOwner
        checkZeroAddress(_recipient)
        returns (bool)
    {
        return _mint(_recipient, _amount);
    }

    function burn(address owner_, uint256 _amount)
        public
        onlyOwner
        checkZeroAddress(owner_)
        checkBalance(owner_, _amount)
        returns (bool)
    {
        return _burn(owner_, _amount);
    }

    function _transfer(
        address _sender,
        address _recipient,
        uint256 _amount
    ) internal checkBalance(_sender, _amount) returns (bool) {
        require(_sender != _recipient, "Invalid Recipient");
        _balances[_sender] -= _amount;
        _balances[_recipient] += _amount;
        // emit Transfer(_sender, _recipient, _amount);
        return true;
    }

    function _mint(address _recipient, uint256 _amount) private returns (bool) {
        require((_consumedSupply + _amount) <= _totalSupply, "Supply Consumed");
        _balances[_recipient] += _amount;
        _consumedSupply += _amount;
        emit Mint(_recipient, _amount);
        return true;
    }

    function _burn(address owner_, uint256 _amount) private returns (bool) {
        _balances[owner_] -= _amount;
        emit Burn(owner_, _amount);
        return true;
    }
}
